
const baseURL = 'http://localhost:3000'
//images links
let avatar = './avatar/Avatar-No-Background.png'
let meImage = './avatar/Avatar-No-Background.png'
let friendImage = './avatar/Avatar-No-Background.png'



const classicToken = localStorage.getItem("token")
const token = `Bearer ${classicToken}`;
let globalProfile = {};
const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    'authorization': token
};
const clintIo = io(baseURL, {
    auth: { token: classicToken }
})

clintIo.on("likePost", (data) => {
    console.log({ likePost: data });

})

clintIo.on("connect_error", (err) => {
    console.log("connect_error:", err.message);
});

clintIo.on("custom_error", (err) => {
    console.log("custom_error:", err.message);
});

clintIo.emit("sayHi", { name: "FROM FE TO BE" }, (response) => {
    console.log({ response });
})
clintIo.on("offline_user", data => {
    console.log({ data });

})





// // // collect messageInfo
function sendMessage(sendTo, type) {
    console.log({ sendTo, type });


    if (type == "ovo") {
        const data = {
            content: $("#messageBody").val(),
            sendTo,
        }
        console.log({ data });

        clintIo.emit('sendMessage', data)
    } else if (type == "group") {
        const data = {
            content: $("#messageBody").val(),
            groupId: sendTo,
        }
        clintIo.emit('sendGroupMessage', data)

    }

}

// // // // // //sendCompleted
clintIo.on('successMessage', (data) => {

    const onclickAttr = document.getElementById("sendMessage").getAttribute("onclick")
    const [base, currentOpenedChat] = onclickAttr?.match(/sendMessage\('([^']+)'/) || [];

    const { content, sendTo } = data
    console.log({ sendTo, currentOpenedChat });

    if (sendTo == currentOpenedChat) {
        const div = document.createElement('div');

        div.className = 'me text-end p-2';
        div.dir = 'rtl';
        const imagePath = globalProfile.profilePicture ? `${baseURL}/uploads/${globalProfile.profilePicture}` : avatar;
        div.innerHTML = `
    <img class="chatImage" src="${imagePath}" alt="" srcset="">
    <span class="mx-2">${content}</span>
    `;
        document.getElementById('messageList').appendChild(div);
        $(".noResult").hide()
        $("#messageBody").val('')
    }
})


// // // // // // // // // //receiveMessage
clintIo.on("newMessage", (data) => {
    console.log({ RM: data });
    const { content, from, groupId } = data
    console.log({ from });

    let imagePath = avatar;
    if (from?.profilePicture) {
        imagePath = `${baseURL}/uploads/${from.profilePicture}`
    }
    const onclickAttr = document.getElementById("sendMessage").getAttribute("onclick")
    const [base, currentOpenedChat] = onclickAttr?.match(/sendMessage\('([^']+)'/) || [];
    console.log({ currentOpenedChat });
    console.log({ onclickAttr, currentOpenedChat });

    if ((!groupId && currentOpenedChat === from) || (groupId && currentOpenedChat === groupId)) {
        if (from?.toString() != globalProfile._id.toString()) {
            const div = document.createElement('div');
            div.className = 'myFriend p-2';
            div.dir = 'ltr';
            div.innerHTML = `
    <img class="chatImage" src="${imagePath}" alt="" srcset="">
    <span class="mx-2">${content}</span>
    `;
            document.getElementById('messageList').appendChild(div);
        }

    } else {

        if (groupId) {
            $(`#g_${groupId}`).show();
        } else {
            $(`#c_${from}`).show();

        }
        const audio = document.getElementById("notifyTone");
        audio.currentTime = 0; // restart from beginning
        audio.play().catch(err => console.log("Audio play blocked:", err));
    }
})


// // // ******************************************************************** Show chat conversation
function showData(sendTo, chat) {
    document.getElementById("sendMessage").setAttribute("onclick", `sendMessage('${sendTo}' , "ovo")`);

    document.getElementById('messageList').innerHTML = ''
    if (chat?.message?.length) {
        $(".noResult").hide()
        for (const message of chat.message) {

            if (message.createdBy.toString() == globalProfile._id.toString()) {
                const div = document.createElement('div');
                div.className = 'me text-end p-2';
                div.dir = 'rtl';
                div.innerHTML = `
                <img class="chatImage" src="${meImage}" alt="" srcset="">
                <span class="mx-2">${message.content}</span>
                `;
                document.getElementById('messageList').appendChild(div);
            } else {

                const div = document.createElement('div');
                div.className = 'myFriend p-2';
                div.dir = 'ltr';
                div.innerHTML = `
                <img class="chatImage" src="${friendImage}" alt="" srcset="">
                <span class="mx-2">${message.content}</span>
                `;
                document.getElementById('messageList').appendChild(div);
            }

        }
    } else {
        const div = document.createElement('div');

        div.className = 'noResult text-center  p-2';
        div.dir = 'ltr';
        div.innerHTML = `
        <span class="mx-2">Say Hi to start the conversation.</span>
        `;
        document.getElementById('messageList').appendChild(div);
    }

    $(`#c_${sendTo}`).hide();


}

// // // // // // // // //get chat conversation between 2 users and pass it to ShowData fun
function displayChatUser(userId) {
    console.log({ userId });
    axios({
        method: 'get',
        url: `${baseURL}/chat/${userId}`,
        headers
    }).then(function (response) {
        const data = response.data?.data
        console.log(data, "testttttttttttttttttttttt");
        if (data) {
            if (data.participants[0]._id.toString() == globalProfile._id.toString()) {
                meImage = data.participants[0].profilePicture ? `${baseURL}/uploads/${data.participants[0].profilePicture}` : avatar
                friendImage = data.participants[1].profilePicture ? `${baseURL}/uploads/${data.participants[1].profilePicture}` : avatar
            } else {
                meImage = data.participants[1].profilePicture ? `${baseURL}/uploads/${data.participants[1].profilePicture}` : avatar
                friendImage = data.participants[0].profilePicture ? `${baseURL}/uploads/${data.participants[0].profilePicture}` : avatar
            }

            showData(userId, data)
        } else {
            showData(userId, 0)
        }

    }).catch(function (error) {
        console.log(error);
        console.log({ status: error.status });
        if (error.status) {
            showData(userId, 0)
        } else {
            alert("Ops something went wrong")
        }

    });
}

// // // // ********************************************************************
// // // // // ******************************************************************** Show  group chat conversation
function showGroupData(sendTo, chat) {
    console.log(sendTo , chat);
    
    document.getElementById("sendMessage").setAttribute("onclick", `sendMessage('${sendTo}' , "group")`);

    document.getElementById('messageList').innerHTML = ''
    if (chat?.length) {
        $(".noResult").hide()
        console.log(chat);

        for (const message of chat) {

            if (message.createdBy?._id?.toString() == globalProfile._id?.toString()) {
                const div = document.createElement('div');
                div.className = 'me text-end p-2';
                div.dir = 'rtl';
                div.innerHTML = `
                <img class="chatImage" src="${meImage}" alt="" srcset="">
                <span class="mx-2">${message.content}</span>
                `;
                document.getElementById('messageList').appendChild(div);
            } else {

                const div = document.createElement('div');
                div.className = 'myFriend p-2';
                div.dir = 'ltr';
                const friendImage = message.createdBy.profilePicture ? `${baseURL}/uploads/${message.createdBy.profilePicture}` : avatar
                div.innerHTML = `
                <img class="chatImage" src="${friendImage}" alt="" srcset="">
                <span class="mx-2">${message.content}</span>
                `;
                document.getElementById('messageList').appendChild(div);
            }

        }
    } else {
        const div = document.createElement('div');

        div.className = 'noResult text-center  p-2';
        div.dir = 'ltr';
        div.innerHTML = `
        <span class="mx-2">Say Hi to start the conversation.</span>
        `;
        document.getElementById('messageList').appendChild(div);
    }
    $(`#g_${sendTo}`).hide();


}
// // // // // // // ********************************************************************
function displayGroupChat(groupId) {
    console.log({ groupId });
    axios({
        method: 'get',
        url: `${baseURL}/chat/group/${groupId}`,
        headers
    }).then(function (response) {
        console.log(response.data?.data , "from group");

        const { message } = response.data?.data
        console.log({ message });
        if (message) {
            meImage = globalProfile.profilePicture ? `${baseURL}/uploads/${globalProfile.profilePicture}` : avatar
            showGroupData(groupId, message)
        } else {
            showGroupData(groupId, 0)
        }

    }).catch(function (error) {
        console.log(error);
        console.log({ status: error.status });
        if (error.status) {
            showGroupData(groupId, 0)
        } else {
            alert("Ops something went wrong")
        }

    });
}
// // // // ==============================================================================================


// // ********************************************************* Show Users list 
// Display Users
function getUserData() {
    axios({
        method: 'get',
        url: `${baseURL}/user`,
        headers
    }).then(function (response) {
        console.log({ D: response.data });

        const { user, groups } = response.data?.data;
        console.log({ user });

        globalProfile = user;
        let imagePath = avatar;
        if (user.profilePicture) {
            imagePath = `${baseURL}/uploads/${user.profilePicture}`
        }
        document.getElementById("profileImage").src = imagePath
        document.getElementById("userName").innerHTML = `${user.username}`
        showUsersData(user.friends)
        showGroupList(groups)
        showFriendRequests(user.friendRequests)
    }).catch(function (error) {
        console.log(error);
    });
}

// // ********************************************************* Friends APIs Frontend
function handleSendFriendRequest() {
    const friendInput = document.getElementById("friendInput");
    const friendIdentifier = friendInput?.value?.trim();
    if (!friendIdentifier) {
        setFriendReqAlert("Please enter a User ID or Email", "danger");
        return;
    }
    sendFriendRequest(friendIdentifier);
}

function sendFriendRequest(friendIdentifier) {
    const sendBtn = document.getElementById("sendFriendReqBtn");
    if (sendBtn) sendBtn.disabled = true;

    axios({
        method: 'post',
        url: `${baseURL}/users/friends/request/${friendIdentifier}`,
        headers
    }).then(function (response) {
        setFriendReqAlert(response.data?.message || "Friend request sent successfully!", "success");
        const friendInput = document.getElementById("friendInput");
        if (friendInput) friendInput.value = "";
        getUserData();
    }).catch(function (error) {
        const msg = error.response?.data?.message || error.message || "Failed to send friend request";
        setFriendReqAlert(msg, "danger");
    }).finally(function () {
        if (sendBtn) sendBtn.disabled = false;
    });
}

function acceptFriendRequest(friendId) {
    axios({
        method: 'patch',
        url: `${baseURL}/users/friends/accept/${friendId}`,
        headers
    }).then(function (response) {
        alert(response.data?.message || "Friend request accepted!");
        getUserData();
    }).catch(function (error) {
        alert(error.response?.data?.message || error.message || "Failed to accept friend request");
    });
}

function rejectFriendRequest(friendId) {
    axios({
        method: 'patch',
        url: `${baseURL}/users/friends/reject/${friendId}`,
        headers
    }).then(function (response) {
        alert(response.data?.message || "Friend request rejected");
        getUserData();
    }).catch(function (error) {
        alert(error.response?.data?.message || error.message || "Failed to reject friend request");
    });
}

function setFriendReqAlert(message, type = "success") {
    const alertBox = document.getElementById("friendReqAlert");
    if (!alertBox) return;
    alertBox.style.display = "block";
    alertBox.className = `small mt-1 text-${type}`;
    alertBox.innerText = message;
    setTimeout(() => {
        if (alertBox) alertBox.style.display = "none";
    }, 5000);
}

// Show pending friend requests list
function showFriendRequests(requests = []) {
    const container = document.getElementById("pendingRequestsContainer");
    const list = document.getElementById("pendingRequestsList");
    if (!container || !list) return;

    if (!requests || requests.length === 0) {
        container.style.display = "none";
        list.innerHTML = "";
        return;
    }

    container.style.display = "block";
    let cartonna = "";
    for (let i = 0; i < requests.length; i++) {
        const reqUser = requests[i];
        let imagePath = avatar;
        if (reqUser.profilePicture) {
            imagePath = `${baseURL}/uploads/${reqUser.profilePicture}`;
        }
        cartonna += `
        <div class="d-flex align-items-center justify-content-between my-2 p-2" style="background-color: #1a1a1a; border-radius: 6px;">
            <div class="d-flex align-items-center">
                <img class="chatImage me-2" src="${imagePath}" alt="" />
                <span>${reqUser.username || reqUser.email}</span>
            </div>
            <div>
                <button class="btn btn-sm btn-success me-1" onclick="acceptFriendRequest('${reqUser._id}')">Accept</button>
                <button class="btn btn-sm btn-outline-danger" onclick="rejectFriendRequest('${reqUser._id}')">Reject</button>
            </div>
        </div>
        `;
    }
    list.innerHTML = cartonna;
}

// Show friends list
function showUsersData(users = []) {
    let cartonna = ``
    for (let i = 0; i < users.length; i++) {
        let imagePath = avatar;
        if (users[i].profilePicture) {
            imagePath = `${baseURL}/uploads/${users[i].profilePicture}`
        }
        cartonna += `
        <div onclick="displayChatUser('${users[i]._id}')" class="chatUser my-2">
        <img class="chatImage" src="${imagePath}" alt="" srcset="">
        <span class="ps-2">${users[i].username}</span>
        <span id="${"c_" + users[i]._id}" class="ps-2 closeSpan">
           🟢
        </span>
    </div>
        
        `
    }


    document.getElementById('chatUsers').innerHTML = cartonna;
}

// // // // // Show groups list
function showGroupList(groups = []) {
    let cartonna = ``
    for (let i = 0; i < groups.length; i++) {
        let imagePath = avatar;
        if (groups[i].group_image) {
            imagePath = `${baseURL}/uploads/${groups[i].group_image}`
        }
        cartonna += `
        <div onclick="displayGroupChat('${groups[i]._id}')" class="chatUser my-2">
        <img class="chatImage" src="${imagePath}" alt="" srcset="">
        <span class="ps-2">${groups[i].group}</span>
           <span id="${"g_" + groups[i]._id}" class="ps-2 closeSpan">
           🟢
        </span>
    </div>

        `
        clintIo.emit("join_room", { roomId: groups[i].roomId })

    }


    document.getElementById('chatGroups').innerHTML = cartonna;
}
getUserData()




