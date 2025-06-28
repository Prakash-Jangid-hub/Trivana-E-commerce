const keyword = req.query.search
  ? {
      $or: [
        { name: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
        { category: { $regex: req.query.search, $options: "i" } },
      ],
    }
  : {};



  export const getAvailableFilters = async (req, res) => {
  const search = req.query.search || "";

  try {
    // Find products matching the search
    const products = await Product.find({
      name: { $regex: search, $options: "i" },
    });

    if (!products.length) {
      return res.status(200).json({ filters: [] });
    }

    // Infer filters based on category or keywords
    const filters = new Set();

    // Simple logic to decide filters based on product fields
    for (const p of products) {
      if (p.gender) filters.add("gender");
      if (p.material) filters.add("material");
      if (p.brand) filters.add("brand");
      if (p.warranty) filters.add("warranty");
      if (p.type) filters.add("type");
    }

    return res.status(200).json({ filters: [...filters] });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load filters", error: error.message });
  }
};

