const Link = require("../models/Link");

exports.generateLink = async (certificateId) => {
  const link = new Link({
    certificate: certificateId,
    url: `http://yourdomain.com/certificates/${certificateId}`,
  });

  await link.save();
  return link.url;
};
