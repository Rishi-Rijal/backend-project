import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateCurrentAccountDetails,
    updateUserAvatar,
    updateUserCoverImage

}
    from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../controllers/auth.controller.js";


const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }]),
    registerUser)

router.route("/login").post(upload.none(), loginUser)

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/user")
    .get(verifyJWT, getCurrentUser)
    .patch(verifyJWT, updateCurrentAccountDetails);

router.route("/update-coverimage").post(
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
)
router.route("/update-coverimage").post(
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage
)

export default router;