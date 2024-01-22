const isObject = (value: any) => value !== null && (typeof value === 'object' || typeof value === 'function');

const isPromise = (value: any) =>
  value instanceof Promise ||
  (isObject(value) && typeof value.then === 'function' && typeof value.catch === 'function');

export default isPromise;
