import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { isValidEmail } from "../validators/emailValidator.js";
import { isValidPassword } from "../validators/passwordValidator.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullName, password } = req.body;
    console.log(req.body);

    if (!(username && email && fullName && password)) {
        throw new ApiError(400, "Fill all the required fields");
    }

    if (!isValidEmail(email)) {
        throw new ApiError(400, "Invalid email");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existingUser) {
        throw new ApiError(409, "Username or Email Already taken");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required!")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    let coverImage = ""
    if (req.files?.coverImage) {
        const coverImageLocalPath = req.files?.coverImage[0]?.path;
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }


    const { valid, errors: errorsArr } = isValidPassword(password);
    if (!valid) {
        throw new ApiError(400, "invalid password", errorsArr);
        // throw new ApiError(400, "invalid password", errorsArr)
    }
    // console.log(username, email, password, fullName);
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while saving the data")
    }


    return res.status(201).json(new ApiResponse(200, createdUser, "User Registered Successfully!"));

})

export { registerUser }
