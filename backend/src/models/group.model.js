const GroupSchema = new Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      members: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          index: true, // Index for better query performance
        },
      ],
      admins: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          index: true,
        },
      ],
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
      messages: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Message",
        },
      ],
      groupIcon: {
        type: String,
      },
      description: {
        type: String,
        maxlength: 300,
        default: "",
      },
    },
    { timestamps: true }
  );

const Group = mongoose.model("Group", GroupSchema);

export default Group;
