

myApp.controller('profileController',function($scope,$http, $location, $cookies, $cookieStore, Upload) {
  var sessionString = $cookies.get('sessionString');
  var url = $location.path().split('/');
  $scope.username = url[2];
  $scope.edit=false;
  $scope.icon="fa fa-pencil-square-o btnEdit"

  $scope.uploadProfilePic = function($file){
    Upload.upload({
      url: 'http://silo.soic.indiana.edu:54545/uploadProfilePic',
      file: $file,
      data:{'username': $scope.username},
    }).progress(function(e){}).then(function(data, status, headers, config){
      console.log(data);
    });
  }

  /**
   * [Function to redirect user to add publications page]
   * @return {[type]} [description]
   */
  $scope.redirectAddPublication = function(){
    $location.path('/publication');
  }

  $scope.editProfile=function(){

    $scope.edit=!$scope.edit;
    if($scope.edit)
    $scope.icon="fa fa-floppy-o btnEdit"
    else
    $scope.icon="fa fa-pencil-square-o btnEdit"
  }


  $scope.followUser = function(){
    $http({
          url: "http://silo.soic.indiana.edu:54545/followSomeone",
          method: "POST",
          data: {
            'username':$scope.username,
            'sessionString': sessionString
        },

      }).then(function success(response){
        if(response.status == 200){
          if(response.data.status == false && response.data.msg!=undefined && response.data.msg!="")
            alert(response.data.msg);
          else{
            alert("Followed Successfully");

          }
        }
      },
    function error(response){

    }
    );
  }

  $http({
        url: "http://silo.soic.indiana.edu:54545/getUserInfo",
        method: "POST",
        data: {
          'username':$scope.username,
          'sessionstring': sessionString
      },

      }).then(function success(response){
        if(response.status==200){
          if(response.data.status=="false"){
            if(response.data.msg!="")
              alert(response.data.msg)
          }
          else{
            var userinfo = response.data.msg;
            var sessString = userinfo.user.sessionString;

            if(sessString!=undefined && sessString!="" && sessString == sessionString)
              $scope.allowEdit = true;
            else {
              $scope.allowEdit = false;
            }
            console.log(userinfo);
            $scope.firstname = userinfo.user.firstName;
            $scope.lastname = userinfo.user.lastName;
            $scope.name=$scope.firstname+" "+$scope.lastname;
            $scope.imgLocation = "http://simpleicon.com/wp-content/uploads/user1.png";
            $scope.address = userinfo.userInfo.location.address != undefined && userinfo.userInfo.location.address.trim()!=""?userinfo.userInfo.location.address + ',':"";
            $scope.city = userinfo.userInfo.location.city != undefined && userinfo.userInfo.location.city.trim()!=""?userinfo.userInfo.location.city + ',':"";
            $scope.state = userinfo.userInfo.location.state;
            $scope.country = userinfo.userInfo.location.country;
            $scope.summary =  userinfo.userInfo.summary;
            $scope.university = userinfo.userInfo.university;
            debugger
            if(userinfo.userInfo.picture!=""){
              $scope.imgLocation = userinfo.userInfo.picture;
            }
            $scope.dob = new Date(userinfo.userInfo.dob).toLocaleDateString("en");
            console.log(userinfo);
          }
        }
      },
      function error(response){
        alert("Error occured while authenticating user");
      }
    );


    $http({
          url: "http://silo.soic.indiana.edu:54545/getUserFollowers",
          method: "POST",
          data: {
            'username':$scope.username,
            'sessionString': sessionString
        },

      }).then(function success(response){
        if(response.status == 200){
          if(response.data.status == false && response.data.msg!=undefined && response.data.msg!="")
            alert(response.data.msg);
          else{
            var followerInfo = response.data.msg.userInfo;
            $scope.followUsernames = followerInfo.usernames;

          }
        }
      },
    function error(response){

    }
    );



    $http({
          url: "http://silo.soic.indiana.edu:54545/getUserGroups",
          method: "POST",
          data: {
            'username':$scope.username,
            'sessionString': sessionString
        },

      }).then(function success(response){
        if(response.status == 200){
          if(response.data.status == "false" && response.data.msg!=undefined && response.data.msg!="")
            alert(response.data.msg);
          else{
            var groupInfo = response.data.msg.groupInfo
            var groupNames = []
            for(var i = 0; i<groupInfo.length;i++){
              groupNames.push(groupInfo[i].groupName)
            }
            $scope.groupNames = groupNames;
          }
        }
      },
    function error(response){

    }
    );


    $http({
          url: "http://silo.soic.indiana.edu:54545/getUserSkills",
          method: "POST",
          data: {
            'username':$scope.username,
            'sessionString': sessionString
        },

      }).then(function success(response){
        if(response.status == 200){
          if(response.data.status == "false" && response.data.msg!=undefined && response.data.msg!="")
            alert(response.data.msg);
          else{
            $scope.userSkills = response.data.msg;
          }
        }
      },
    function error(response){

    }
    );



    $http({
          url: "http://silo.soic.indiana.edu:54545/getUserPublications",
          method: "POST",
          data: {
            'username':$scope.username,
            'sessionString': sessionString
        },

      }).then(function success(response){
        if(response.status == 200){
          if(response.data.status == false && response.data.msg!=undefined && response.data.msg!="")
            alert(response.data.msg);
          else{

            var publicationInfo = response.data.msg.publicationInfo;

            $scope.publicationInfo = publicationInfo;
          }
        }
      },
    function error(response){
debugger
    }
    );


    $scope.addUserSkill = function(event){
      var skillName = event.currentTarget.value;
      if(skillName!=undefined && skillName.trim()!=""){
        $http({
              url: "http://silo.soic.indiana.edu:54545/addSkill",
              method: "POST",
              data: {
                'sessionString': sessionString,
                'skillName': skillName
            },

          }).then(function success(response){
            if(response.status == 200){
              if(response.data.status == false && response.data.msg!=undefined && response.data.msg!="")
                alert(response.data.msg);
              else{
                  console.log("skill added");
              }
            }
          },
        function error(response){
    debugger
        }
        );
      }
    }


}); //end of controller