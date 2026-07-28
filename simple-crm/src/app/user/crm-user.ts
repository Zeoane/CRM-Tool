export interface CrmUser {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
}

export interface CrmUserRow extends CrmUser {
  id: string;
}
