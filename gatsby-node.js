const { initStitch } = require("./utils/init-stitch");

exports.onPreInit = () => console.log("Loaded gatsby-source-mongodb-stitch");

exports.sourceNodes = async (
  { actions: { createNode }, createContentDigest },
  { functions, stitchId }
) => {
  const stitchClient = await initStitch(stitchId);

  const allResults = [];

  const createResultNode = async ({
    name,
    args,
    resultType,
    getResultId = (result) => result._id,
  }) => {
    const documents = await stitchClient.callFunction(name, args);
    if (documents.length === 0) {
      console.warn(`WARN: No documents matched your query: ${name}.`);
    }

    documents.forEach((doc) => {
      const content = JSON.stringify(doc);
      createNode({
        id: getResultId(doc),
        parent: null,
        children: [],
        internal: {
          type: resultType,
          contentDigest: createContentDigest(content),
        },
        ...doc,
      });
    });
  };

  functions.forEach((f) => allResults.push(createResultNode(f)));
  return Promise.all(allResults);
};
