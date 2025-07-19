export function getHelper() {
  return {
    formatDate: (date: Date) => date.toISOString().split("T")[0],
    capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
    isEmpty: (obj: object) => Object.keys(obj).length === 0,
  };
}
