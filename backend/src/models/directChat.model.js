import mongoose, { Schema } from "mongoose"


const directchatSchema = new Schema(
    {
        participantsKey: {
            type: String,
            unique: true,
        },
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                // validate: {
                //     validator: function (v) {
                //         return v.length === 2 && v[0].toString() !== v[1].toString();
                //     },
                //     message: "Direct chat must have exactly two participants"
                // }
            }
        ],
        chatCreatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        typingUsers: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            }
        ]
    },
    {
        timestamps: true,
    }
);

directchatSchema.pre("save", function () {
    const sorted = this.participants
        .map(id => id.toString())
        .sort();

    // console.log("sorted: ", sorted);

    this.participants = sorted.map(id => new mongoose.Types.ObjectId(id));
    console.log("participants: ", this.participants);

    // 🔥 create unique key
    this.participantsKey = sorted.join("_");
    // console.log("participantsKey: ", this.participantsKey);

});

// directchatSchema.index({ participants: 1 }, { unique: true });

export const DirectChat = mongoose.model('DirectChat', directchatSchema);