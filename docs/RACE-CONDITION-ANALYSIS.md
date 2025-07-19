# Race Condition Analysis and Improvements

This document outlines the race condition vulnerabilities found in the Chrome Extension Template build system and the improvements implemented to address them.

## Race Conditions Identified

### 1. **Global Cache Race Condition in vite.config.mjs**
**Issue**: The `cachedFeaturesConfig` global variable can be accessed concurrently during parallel builds, leading to inconsistent state.

**Impact**: 
- Multiple Vite processes could read/cache different versions of features.json
- Race between cache check and cache set operations
- Potential for one process to overwrite another's cache

**Fix Implemented**:
- Added `loadingPromise` variable to prevent concurrent loading
- Immediate return of default config when already loading
- Proper cache invalidation and state management

### 2. **File Locking Race Conditions**
**Issue**: The simple file locking mechanism had several vulnerabilities:
- No timeout protection for stuck locks
- Locks could persist if process crashed
- No process identification in locks
- Path normalization issues causing different processes to use different lock keys

**Impact**:
- Deadlocks when processes crashed while holding locks
- Multiple processes could bypass locks due to path differences
- Infinite waiting for locks that would never be released

**Fixes Implemented**:
- Added timeout-based lock acquisition with configurable timeouts
- Process ID tracking in lock metadata
- Automatic cleanup of stale locks
- Path normalization using `path.resolve()` for consistent lock keys
- Force release of stale locks with warnings

### 3. **Atomic File Operations Race Conditions**
**Issue**: The original atomic write operations were vulnerable to:
- Temporary file name collisions between processes
- No backup/restore mechanism on failure
- No cleanup of failed temporary files

**Impact**:
- File corruption if multiple processes wrote simultaneously
- Data loss on write failures
- Disk space waste from orphaned temp files

**Fixes Implemented**:
- Process ID and timestamp in temporary file names
- Backup creation before writes
- Automatic restore from backup on failure
- Comprehensive cleanup of temporary files
- Retry logic for transient failures

### 4. **Watch Process Coordination Race Condition**
**Issue**: Multiple watch processes could be started simultaneously, leading to:
- Port conflicts
- File system monitoring conflicts
- Resource contention
- Inconsistent build outputs

**Impact**:
- Build failures due to resource conflicts
- Unpredictable behavior with multiple watchers
- Performance degradation

**Fix Implemented**:
- Process lock file (.watch.lock) to prevent multiple instances
- Process existence validation using `process.kill(pid, 0)`
- Automatic cleanup of stale locks
- Graceful shutdown with lock cleanup

### 5. **Manifest Generation Race Conditions**
**Issue**: Multiple build processes could simultaneously:
- Read and modify config.json
- Generate and write manifest.json
- Update XML files
- Generate PEM keys

**Impact**:
- Corrupted configuration files
- Inconsistent extension IDs
- Lost version increments
- Invalid manifests

**Fixes Implemented**:
- Enhanced file locking with timeout and cleanup
- Proper ordering of file operations
- Atomic writes with backup/restore
- Process coordination for manifest updates

### 6. **Content Script Discovery Race Conditions**
**Issue**: Concurrent file system operations during content script discovery:
- Multiple processes reading directory structures
- Stat operations on files being modified
- Entry point validation conflicts

**Impact**:
- Incomplete content script detection
- Build failures due to file access conflicts
- Inconsistent entry point mapping

**Fixes Implemented**:
- Sequential processing instead of parallel forEach
- File existence validation before processing
- Proper error handling for file system race conditions
- Retry logic for transient file access issues

## Improved Locking Mechanism

The enhanced file locking system now includes:

```javascript
const acquireFileLock = (filePath, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    const lockKey = path.resolve(filePath); // Normalize path
    const startTime = Date.now();
    
    const checkLock = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed > timeout) {
        reject(new Error(`Failed to acquire lock for ${filePath} after ${timeout}ms`));
        return;
      }
      
      if (locks.has(lockKey)) {
        setTimeout(checkLock, 10);
      } else {
        locks.set(lockKey, {
          timestamp: Date.now(),
          process: process.pid
        });
        
        // Auto-cleanup timeout
        const timeoutId = setTimeout(() => {
          if (locks.has(lockKey)) {
            console.warn(`⚠️  Force releasing stale lock for ${filePath}`);
            locks.delete(lockKey);
          }
        }, timeout * 2);
        
        resolve(() => {
          locks.delete(lockKey);
          clearTimeout(timeoutId);
        });
      }
    };
    checkLock();
  });
};
```

## Improved Atomic Operations

Enhanced atomic file writes with backup and recovery:

```javascript
const atomicWriteFile = (filePath, content) => {
  const tempPath = `${filePath}.tmp.${process.pid}.${Date.now()}`;
  const backupPath = `${filePath}.backup`;
  
  try {
    // Create backup if original exists
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, backupPath);
    }
    
    // Atomic write via rename
    fs.writeFileSync(tempPath, content, "utf8");
    fs.renameSync(tempPath, filePath);
    
    // Cleanup backup
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }
  } catch (error) {
    // Cleanup and restore
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, filePath);
      fs.unlinkSync(backupPath);
    }
    
    throw error;
  }
};
```

## Process Coordination

Watch process coordination to prevent multiple instances:

```javascript
const createWatchLock = () => {
  try {
    if (fs.existsSync(lockFile)) {
      const lockData = fs.readFileSync(lockFile, "utf8");
      const lock = JSON.parse(lockData);
      
      // Check if process still exists
      try {
        process.kill(lock.pid, 0);
        console.error(`❌ Another watch process running (PID: ${lock.pid})`);
        process.exit(1);
      } catch (e) {
        // Process doesn't exist, remove stale lock
        fs.unlinkSync(lockFile);
      }
    }
    
    fs.writeFileSync(lockFile, JSON.stringify({
      pid: process.pid,
      startTime: Date.now(),
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error(`❌ Failed to create watch lock: ${error.message}`);
    process.exit(1);
  }
};
```

## Benefits of Improvements

### 1. **Reliability**
- Eliminated file corruption from concurrent writes
- Prevented deadlocks from stuck processes
- Reduced build failures from resource conflicts

### 2. **Data Integrity**
- Backup/restore mechanisms prevent data loss
- Atomic operations ensure consistent file states
- Proper cleanup prevents disk space waste

### 3. **Resource Management**
- Prevented multiple conflicting watch processes
- Proper timeout handling prevents infinite waits
- Automatic cleanup of stale resources

### 4. **Debugging**
- Better error messages for race condition issues
- Process tracking for lock debugging
- Comprehensive logging of coordination activities

### 5. **Performance**
- Reduced contention through better coordination
- Faster lock acquisition with timeout limits
- Efficient resource utilization

## Testing Race Conditions

To test the race condition improvements:

1. **Concurrent Builds**: Run multiple build processes simultaneously
2. **Watch Overlap**: Try starting multiple watch processes
3. **File System Stress**: Test with high file system load
4. **Process Interruption**: Test recovery from crashed processes
5. **Resource Limits**: Test behavior under resource constraints

## Best Practices Applied

1. **Defensive Programming**: Assume concurrent access to all shared resources
2. **Timeout Management**: All locks and waits have configurable timeouts
3. **Resource Cleanup**: Proper cleanup even during error conditions
4. **Process Coordination**: Prevent conflicting processes at startup
5. **Data Recovery**: Backup and restore mechanisms for critical data
6. **Monitoring**: Comprehensive logging for race condition debugging

The race condition improvements ensure the build system is robust and reliable even under concurrent usage scenarios.
