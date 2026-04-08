// Centralised response builders. Controllers must never call res.json() directly.
// One helper per response shape ensures the API surface is consistent.

const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const created = (res, data, message = 'Created successfully') => {
  return success(res, data, message, 201);
};

const paginated = (res, rows, count, page, limit) => {
  return res.status(200).json({
    success: true,
    data: rows,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
    },
  });
};

module.exports = { success, created, paginated };
