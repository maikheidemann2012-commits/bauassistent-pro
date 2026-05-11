export type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  aktiv: boolean;
};

export const users: User[] = [
  {
    id: "1",
    email: "maik@bauassistent.de",
    password: "maik2024",
    name: "Maik Heidemann",
    aktiv: true,
  },
  {
    id: "2",
    email: "demo@123.de",
    password: "123",
    name: "Max Mustermann",
    aktiv: true,
  },
];