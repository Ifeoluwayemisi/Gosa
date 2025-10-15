import prisma from "../config/prisma.js";

// 🕒 Delivery time estimator (mock logic for now)
const calculateDeliveryTime = (address) => {
  if (!address?.state) return "Unknown";

  const state = address.state.trim().toLowerCase();

  switch (state) {
    case "lagos":
      return "1-2 days";
    case "abuja":
      return "2-3 days";
    case "port harcourt":
      return "2-4 days";
    case "ogun":
      return "2-4 days";
    case "oyo":
      return "3-5 days";
    default:
      return "3-7 days";
  }
};

// 🏠 Get all addresses for user
export const getUserAddresses = async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { isDefault: "desc" },
    });

    res.json({ success: true, addresses });
  } catch (err) {
    console.error("Error fetching addresses:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch addresses",
    });
  }
};

// ➕ Add new address
export const addAddress = async (req, res) => {
  try {
    const { label, street, city, state, postal, country, isDefault } = req.body;

    // Unset old default if this one is marked default
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    // Calculate estimated delivery
    const estimatedDelivery = calculateDeliveryTime({ state });

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
        estimatedDelivery,
      },
    });

    res.json({ success: true, address });
  } catch (err) {
    console.error("Error adding address:", err);
    res.status(500).json({
      success: false,
      error: "Failed to add address",
    });
  }
};

// ✏️ Update existing address
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, street, city, state, postal, country, isDefault } = req.body;

    // Ensure address exists and belongs to this user
    const existing = await prisma.address.findFirst({
      where: { id: parseInt(id), userId: req.user.id },
    });

    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: "Address not found" });

    // If isDefault is true, unset previous defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    // Only recalc if state changed or if none exists
    let estimatedDelivery = existing.estimatedDelivery;
    if (state && state.toLowerCase() !== existing.state?.toLowerCase()) {
      estimatedDelivery = calculateDeliveryTime({ state });
    }

    const address = await prisma.address.update({
      where: { id: existing.id },
      data: {
        label,
        street,
        city,
        state,
        postal,
        country,
        isDefault: !!isDefault,
        estimatedDelivery,
      },
    });

    res.json({ success: true, address });
  } catch (err) {
    console.error("Error updating address:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update address",
    });
  }
};

// ❌ Delete address
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.address.delete({
      where: { id: parseInt(id), userId: req.user.id },
    });

    res.json({ success: true, message: "Address deleted successfully" });
  } catch (err) {
    console.error("Error deleting address:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete address",
    });
  }
};
