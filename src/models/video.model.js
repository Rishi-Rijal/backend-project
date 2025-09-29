import mongoose from "mongoose";
import mongooseAggregatePaginateV2 from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({
    videoFile: {
        type: String, //cloud URL
        required: true
    },
    thumbnail: {
        type: String, //cloud URL
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String, //cloud URL
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        default : 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }


}, { timestamps: true });

videoSchema.plugin(mongooseAggregatePaginateV2);
export const Video = mongoose.model("Video", videoSchema)