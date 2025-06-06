import * as puppeteer from 'puppeteer';

async function debugTest() {
  console.log('🔍 Debug test starting...');
  
  try {
    console.log('🚀 Launching browser...');
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    console.log('✅ Browser launched');
    
    const page = await browser.newPage();
    console.log('📄 Page created');
    
    await page.goto('https://example.com');
    console.log('🌐 Navigated to example.com');
    
    const title = await page.title();
    console.log(`📰 Page title: ${title}`);
    
    await browser.close();
    console.log('🔒 Browser closed');
    
    console.log('✅ Debug test completed successfully');
  } catch (error) {
    console.error('❌ Debug test failed:', error);
  }
}

debugTest();
