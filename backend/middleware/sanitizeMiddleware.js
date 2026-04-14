const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);

const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (!isObject(value)) {
    return value;
  }

  const cleanObject = {};

  Object.entries(value).forEach(([key, val]) => {
    // Drop keys commonly used in NoSQL injection payloads.
    if (key.includes("$") || key.includes(".")) {
      return;
    }

    cleanObject[key] = sanitizeValue(val);
  });

  return cleanObject;
};

const sanitizeObjectInPlace = (target) => {
  if (!isObject(target)) {
    return;
  }

  Object.keys(target).forEach((key) => {
    if (key.includes("$") || key.includes(".")) {
      delete target[key];
      return;
    }

    target[key] = sanitizeValue(target[key]);
  });
};

const sanitizeInputs = (req, _res, next) => {
  sanitizeObjectInPlace(req.body);
  sanitizeObjectInPlace(req.query);
  sanitizeObjectInPlace(req.params);
  next();
};

export default sanitizeInputs;
