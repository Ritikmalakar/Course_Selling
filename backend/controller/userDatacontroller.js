import User from "../models/user.js"

export async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user not found"
      })
    }
    res.status(200).send({
      success: true,
      message: "get user",
      user
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: error.message,
      error

    })
  }
}


export async function updateProfile(req, res) {
  try {

    const userId = req.userId;

    const { description, name } = req.body;

    let photoUrl;

    if (req.file) {
      photoUrl = req.file.path;
    }

    const updateData = {
      description,
      name
    };

    if (photoUrl) {
      updateData.photoUrl = photoUrl;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "user not found"
      });
    }

    res.status(200).send({
      success: true,
      message: "update profile successfully",
      user
    });

  } catch (error) {

    res.status(500).send({
      success: false,
      message: error.message,
      error
    });

  }
}
