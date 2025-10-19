import { ContractExecuteTransaction, ContractFunctionParameters } from "@hashgraph/sdk";

export const CONTRACTS = {
  patientIdentity: {
    id: process.env.PATIENT_IDENTITY_CONTRACT_ID!,
    abi: require('../scripts/contracts/compiled/PatientIdentityContract.json').abi
  },
  accessControl: {
    id: process.env.ACCESS_CONTROL_CONTRACT_ID!,
    abi: require('../scripts/contracts/compiled/AccessControlContract.json').abi
  },
  medicalRecords: {
    id: process.env.MEDICAL_RECORDS_CONTRACT_ID!,
    abi: require('../scripts/contracts/compiled/MedicalRecordsContract.json').abi
  }
};
