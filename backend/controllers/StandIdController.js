import OperatorSettingsModel from "../models/OperatorSettingsSchema.js";

export const getStandIds = async (req, res) => {
  try {
    const standIds = await OperatorSettingsModel.distinct("stand_id", {
      "stand_id": { $ne: null }
    });
    res.json(standIds);
  } catch (err) {
    console.error("Ошибка при получении ID стендов:", err);
    res.status(500).json({ message: "Ошибка при получении ID стендов" });
  }
};

export const StandIdsController = { getStandIds };