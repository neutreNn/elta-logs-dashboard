import OperatorSettingsModel from "../models/OperatorSettingsSchema.js";

export const getOperatorNames = async (req, res) => {
  try {
    const operators = await OperatorSettingsModel.distinct("operator_name", {
      "operator_name": { $ne: null }
    });
    res.json(operators);
  } catch (err) {
    console.error("Ошибка при получении имён операторов:", err);
    res.status(500).json({ message: "Ошибка при получении имён операторов" });
  }
};

export const OperatorsController = { getOperatorNames };