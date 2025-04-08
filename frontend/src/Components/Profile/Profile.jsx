import React, { useCallback, useEffect, useState } from "react";
import { Avatar, Typography, TextField, Skeleton } from "@mui/material";
import axios from "axios";
import ProfileIcon from "../../Assets/SVGs/Profile.svg";
import { ReactComponent as CameraIcon } from "../../Assets/SVGs/CameraIcon.svg";
import { ReactComponent as BackIcon } from "../../Assets/SVGs/BackIcon.svg";
import { toast } from "react-toastify";
import ProfileDialog from "../ProfileDialog/ProfileDialog";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [userData, setUserData] = useState({});
  // const [editable, setEditable] = useState(false);
  const [updatedData, setUpdatedData] = useState({ name: "", email: "" });
  const [friendEmail, setFriendEmail] = useState("");
  const [openUpdateProfileDialog, setOpenUpdateProfileDialog] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const navigate = useNavigate();
  const fetchProfileData = async () => {
    try {
      setIsDataLoading(true);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/users/profile`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      setUserData(data.data);
      setUpdatedData({ name: data.data.name, email: data.data.email });
    } catch (err) {
      // setError('Failed to fetch profile data');
    } finally {
      setIsDataLoading(false);
    }
  };

  // const handleEditToggle = () => {
  //   setEditable((prev) => !prev);
  // };

  const [editable, setEditable] = useState(false);

  const handleSaveChanges = async () => {
    try {
      const { data } = await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/v1/users/updateName`,
        { name: updatedData.name },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      toast.success(data.message || "Name updated successfully");
      setEditable(false);
      setUpdatedData((old)=>{
        return {
          ...old,
          name:data.data.name
        }
      })
      setUserData((old)=>{
        return {
          ...old,
          name:data.data.name
        }
      })
    } catch (err) {
      toast.error("Failed to update name");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prev) => ({ ...prev, [name]: value }));
  };

  const inviteFriendHandler = async () => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/users/inviteFriend`,
        { friendMail: friendEmail },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );

      toast.success(data.message);
      setFriendEmail("");
    } catch (error) {
      console.log(error);
      if (error?.response.status === 400) {
        toast.error(error?.response?.data?.message);
        setFriendEmail("");
      }
    }
  };

  const closeProfileUpdateDialog = useCallback(() => {
    setOpenUpdateProfileDialog(false);
  }, []);

  const handleNewProfilePic = useCallback((newProfilePic) => {
    setUserData(() => {
      return {
        ...userData,
        profilePic: newProfilePic,
      };
    });
  }, []);

  const handleProfileClick = async () => {
    setOpenUpdateProfileDialog(true);
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  return (
    <>
      <BackIcon
        className="h-10 w-10 bg-blue-300 p-3 absolute top-28 left-10 rounded-full cursor-pointer"
        onClick={() => {
          navigate("/chat");
        }}
      />
      <section className="rounded-lg shadow-lg bg-white m-5 p-5 flex flex-col md:flex-row justify-center items-center gap-10">
        <section className="flex flex-col items-center gap-4 relative">
          <Avatar
            src={userData.profilePic ? userData?.profilePic : ProfileIcon}
            alt="User Image"
            sx={{ width: 150, height: 150 }}
          />
          <button
            className="absolute bottom-0  right-2 outline bg-white p-2    rounded-xl"
            onClick={handleProfileClick}
          >
            <CameraIcon />
          </button>
        </section>

        <section className="w-full md:w-2/3">
          <Typography variant="h4" className="mb-4">
            User Profile
          </Typography>

          {isDataLoading ? (
            <>
              <Typography variant="h5">Name :</Typography>
              <Typography variant="h6" color="#ffffff">
                <Skeleton variant="text" width={200} height={20} />
              </Typography>
              <Typography variant="h5">Email :</Typography>
              <Typography variant="h6" color="#ffffff">
                <Skeleton variant="text" width={200} height={20} />
              </Typography>
            </>
          ) : (
            <>
              <TextField
                fullWidth
                name="name"
                label="Name"
                variant="outlined"
                margin="normal"
                disabled={!editable}
                value={updatedData.name}
                onChange={handleInputChange}
              />
              <section className="flex gap-3 mt-2">
                {!editable ? (
                  <button
                    className="bg-yellow-400 text-white rounded-md px-4 py-2 hover:bg-yellow-500"
                    onClick={() => setEditable(true)}
                  >
                    Edit Name
                  </button>
                ) : (
                  <button
                    className="bg-green-500 text-white rounded-md px-4 py-2 hover:bg-green-600"
                    onClick={handleSaveChanges}
                  >
                    Save Changes
                  </button>
                )}
              </section>

              <TextField
                fullWidth
                name="email"
                label="Email"
                variant="outlined"
                margin="normal"
                disabled={true}
                value={updatedData.email}
                onChange={handleInputChange}
              />
            </>
          )}

          {/* {editable && (
            <Button
              variant="contained"
              color="success"
              className="mt-4"
              onClick={handleSaveChanges}
            >
              Save Changes
            </Button>
          )} */}
          <section className="lg:flex justify-between items-center p-4 my-4 outline outline-blue-300 rounded-lg gap-5">
            <Typography variant="h4" color="initial">
              Invite a Friend to Chat
            </Typography>
            <TextField
              fullWidth
              name="email"
              label="Email"
              type="email"
              variant="outlined"
              margin="normal"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
            />
            <button
              className="bg-blue-400 text-white rounded-lg px-4 py-3 hover:text-blue-400 hover:bg-white hover:outline hover:outline-blue-400"
              onClick={inviteFriendHandler}
            >
              Invite
            </button>
          </section>
          <section className="px-3 py-3 rounded-lg shadow-lg">
            <Typography variant="h5" color="initial">
              Blocked Users
            </Typography>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {isDataLoading ? (
                [1, 2, 3, 4, 5, 6]?.map((user) => {
                  return (
                    <section
                      className="w-full px-3 py-2 flex justify-between  cursor-pointer bg-blue-300"
                      title={`Click Here to get More Info About ${user.name}`}
                    >
                      <section className="px-3">
                        <Avatar
                          src={ProfileIcon}
                          alt="Preview"
                          sx={{
                            width: 50,
                            height: 50,
                            outline: "2px solid #ffffff",
                            outlineOffset: "2px",
                            background: "#ffffff",
                          }}
                        />
                      </section>
                      <section>
                        <Typography variant="h6" color="#ffffff">
                          <Skeleton variant="text" width={200} height={20} />
                        </Typography>
                      </section>
                    </section>
                  );
                })
              ) : userData?.blockedUsers?.length === 0 ? (
                <Typography
                  className="flex justify-center items-center font-bold "
                  variant="h6"
                >
                  No Users Blocked
                </Typography>
              ) : (
                userData?.blockedUsers?.map((user) => {
                  return (
                    <section
                      className="w-full px-3 py-2 flex justify-between  cursor-pointer bg-blue-300"
                      title={`Click Here to get More Info About ${user.name}`}
                    >
                      <section className="px-3">
                        <Avatar
                          src={user?.profilePic || ProfileIcon}
                          alt="Preview"
                          sx={{
                            width: 50,
                            height: 50,
                            outline: "2px solid #ffffff",
                            outlineOffset: "2px",
                            background: "#ffffff",
                          }}
                        />
                      </section>
                      <section>
                        <Typography variant="h6" color="#ffffff">
                          {user.name}
                        </Typography>
                      </section>
                    </section>
                  );
                })
              )}
            </section>
          </section>
        </section>
      </section>
      <ProfileDialog
        open={openUpdateProfileDialog}
        handleClose={closeProfileUpdateDialog}
        userData={userData}
        handleNewProfilePic={handleNewProfilePic}
      />
    </>
  );
}
