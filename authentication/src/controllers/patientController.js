const patientRepository = require("../repositories/patientRepository");

// Get all patients (for doctors to select when creating sessions)
const getAllPatients = async (req, res, next) => {
  try {
    const userType = req.user["cognito:groups"]?.[0]?.toLowerCase();

    // Only doctors can view the patient list
    if (userType !== "doctors") {
      return res
        .status(403)
        .json({ error: "Only doctors can view patient list" });
    }

    const patients = await patientRepository.getAllPatients();

    // Return simplified patient info
    const patientList = patients.map((patient) => ({
      patientId: patient.userId,
      name: patient.name,
      email: patient.email,
      age: patient.age,
      condition: patient.condition,
    }));

    res.json({ patients: patientList });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPatients,
};
