const Template = require("../models/Template");

exports.createTemplate = async (req, res) => {
  try {
    const { name, design } = req.body;

    const template = new Template({ name, design });
    await template.save();

    res.status(201).json({ message: "Template created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getTemplates = async (req, res) => {
  try {
    const templates = await Template.find();
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
