import bcrypt from "bcrypt";

const password = "@Olorunmi81";
const hashed = await bcrypt.hash(password, 10);
console.log(hashed);
