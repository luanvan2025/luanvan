import prisma from "../models/prismaClient.js";

//Tạo địa chỉ mới
export const createAddress = async (req, res) => {
  try {
    const userId = req.user.id;// 1. Lấy userId từ token (địa chỉ phải gắn với user)
    // 2. Lấy dữ liệu gửi từ client (body request)
    const {
      full_name,
      phone,
      street_address,
      ward,
      district,
      city,
      postal_code,
      address_type,
      is_default,
      is_note
    } = req.body;
    // 2. Đếm xem user đã có bao nhiêu địa chỉ
    const addressCount = await prisma.addresses.count({
      where: { user_id: userId },
    });
    // 3. Tạo địa chỉ mới
    const newAddress = await prisma.addresses.create({
      data: {
        user_id: userId,
        full_name,
        phone,
        street_address,
        ward,
        district,
        city,
        postal_code,
        address_type,
        is_note,
        // Nếu user chưa có địa chỉ nào thì bắt buộc địa chỉ đầu tiên phải là default,
        // nếu không thì lấy giá trị client gửi (và ép kiểu boolean bằng !!)
        is_default: addressCount === 0 ? true : !!is_default,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // 4. Nếu user thêm địa chỉ mới là default 
    if (newAddress.is_default) {
      // thì cập nhật tất cả địa chỉ khác của user thành is_default = false
      await prisma.addresses.updateMany({
        where: { user_id: userId, id: { not: newAddress.id } },
        data: { is_default: false },
      });
    }

    return res.json({ code: 200, message: "Thêm địa chỉ thành công", data: newAddress });
  } catch (error) {
    console.error("Create address error:", error);
    return res.status(500).json({ message: "Lỗi server", error });
  }
};

/**
 * Lấy danh sách địa chỉ
 */
export const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;// 1. Lấy userId từ token
    // 2. Query DB lấy danh sách địa chỉ của user
    const addresses = await prisma.addresses.findMany({
      where: { user_id: userId },
      orderBy: { is_default: "desc" },//3.Sắp xếp sao cho is_default = true nằm đầu tiên.
    });

    return res.json({ code: 200, message: "Danh sách địa chỉ", data: addresses });//Trả về danh sách.
  } catch (error) {
    console.error("Get addresses error:", error);
    return res.status(500).json({ message: "Lỗi server", error });
  }
};

/**
 * Lấy chi tiết 1 địa chỉ
 */
export const getAddressById = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = parseInt(req.params.id);// 1. Lấy addressId từ params
    //Tìm địa chỉ theo id.
    const address = await prisma.addresses.findUnique({ where: { id: addressId } });
    //Kiểm tra quyền sở hữu (address.user_id === userId).
    if (!address || address.user_id !== userId) {
      return res.status(404).json({ message: "Địa chỉ không tồn tại hoặc không thuộc về bạn" });
    }

    return res.json({ code: 200, message: "Chi tiết địa chỉ", data: address });
  } catch (error) {
    console.error("Get address error:", error);
    return res.status(500).json({ message: "Lỗi server", error });
  }
};

/**
 * Cập nhật địa chỉ 
 */
export const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = parseInt(req.params.id);
    const {
      full_name,
      phone,
      street_address,
      ward,
      district,
      city,
      postal_code,
      is_default,
      is_note,
      address_type,
    } = req.body;

    // Check quyền sở hữu.
    const address = await prisma.addresses.findUnique({ where: { id: addressId } });
    if (!address || address.user_id !== userId) {
      return res.status(404).json({ message: "Địa chỉ không tồn tại hoặc không thuộc về bạn" });
    }
    //Update địa chỉ bằng dữ liệu từ body.
    const updatedAddress = await prisma.addresses.update({
      where: { id: addressId },
      data: {
        full_name,
        phone,
        street_address,
        ward,
        district,
        city,
        postal_code,
        is_default,
        is_note,
        address_type,
      },
    });

    // Nếu set default 
    if (is_default) {
      // thì cập nhật tất cả địa chỉ khác của user thành is_default = false
      await prisma.addresses.updateMany({
        where: { user_id: userId, id: { not: addressId } },
        data: { is_default: false },
      });
    }

    return res.json({ code: 200, message: "Cập nhật địa chỉ thành công", data: updatedAddress });
  } catch (error) {
    console.error("Update address error:", error);
    return res.status(500).json({ message: "Lỗi server", error });
  }
};

/**
 * Xóa địa chỉ
 */
export const deleteAddress = async (req, res) => {
  try {
    //Lấy userId từ JWT, lấy id từ params.
    const userId = req.user.id;
    const addressId = parseInt(req.params.id);
    //Kiểm tra quyền sở hữu.
    const address = await prisma.addresses.findUnique({ where: { id: addressId } });
    if (!address || address.user_id !== userId) {
      return res.status(404).json({ message: "Địa chỉ không tồn tại hoặc không thuộc về bạn" });
    }
    //Nếu hợp lệ thì delete.
    await prisma.addresses.delete({ where: { id: addressId } });

    return res.json({ code: 200, message: "Xóa địa chỉ thành công" });
  } catch (error) {
    console.error("Delete address error:", error);
    return res.status(500).json({ message: "Lỗi server", error });
  }
};

/**
 * Set mặc định
 */
export const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = parseInt(req.params.id);

    const address = await prisma.addresses.findUnique({ where: { id: addressId } });
    if (!address || address.user_id !== userId) {
      return res.status(404).json({ message: "Địa chỉ không tồn tại hoặc không thuộc về bạn" });
    }
        // Set is_default = true cho địa chỉ được chọn.
    await prisma.addresses.update({
      where: { id: addressId },
      data: { is_default: true, updated_at: new Date() },
    });
    // Update tất cả địa chỉ khác của user thành is_default = false
    await prisma.addresses.updateMany({
      where: { user_id: userId, id: { not: addressId } },
      data: { is_default: false },
    });

    return res.json({ code: 200, message: "Đặt địa chỉ mặc định thành công" });
  } catch (error) {
    console.error("Set default address error:", error);
    return res.status(500).json({ message: "Lỗi server", error });
  }
};
