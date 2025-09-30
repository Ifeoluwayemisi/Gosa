import PayStack from "paystack-node";

const paystack = new PayStack(process.env.PAYSTACK_SECRET_KEY);

export default paystack;