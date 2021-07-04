module.exports = function helpers() {
  const API_URL = "api/v1";
  const urlGenerator = (urlBase) => (path) => path.join(API_URL, urlBase, path);

  const schemaOptions = {
    autoIndex: false,
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  };

  return {
    API_URL,
    urlGenerator,
    schemaOptions,
  };
};
