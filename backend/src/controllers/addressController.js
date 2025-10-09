import prisma from "../config/prisma.js";

// Get all addresses for a user
export const getUserAddresses = async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { isDefault: "desc" },
    });
    res.json({ success: true, addresses });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch addresses" });
  }
};

// Simple mock function — replace with real logic / API if available
const calculateDeliveryTime = (address) => {
  // Example logic
  if (address.state.toLowerCase() === "lagos") return "1-2 days";
  if (address.state.toLowerCase() === "abuja") return "2-3 days";
  return "3-7 days"; // default
};

export const getUserAddressesWithDelivery = async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { isDefault: "desc" },
    });

    // Add delivery estimate to each
    const addressesWithDelivery = addresses.map((addr) => ({
      ...addr,
      estimatedDelivery: calculateDeliveryTime(addr),
    }));

    res.json({ success: true, addresses: addressesWithDelivery });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch addresses" });
  }
};

// Add new address
export const addAddress = async (req, res) => {
  try {
    const { label, street, city, state, postal, country, isDefault } = req.body;

    // If isDefault true, unset any other default
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        label,
        street,
        city,
        state,
        postal,
        country,
        isDefault: !!isDefault,
      },
    });

    res.json({ success: true, address });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to add address" });
  }
};

// Update address
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, street, city, state, postal, country, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: parseInt(id), userId: req.user.id },
      data: {
        label,
        street,
        city,
        state,
        postal,
        country,
        isDefault: !!isDefault,
      },
    });

    res.json({ success: true, address });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to update address" });
  }
};

// Delete address
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.address.delete({
      where: { id: parseInt(id), userId: req.user.id },
    });
    res.json({ success: true, message: "Address deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to delete address" });
  }
};
