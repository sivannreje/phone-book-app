'use strict';

angular.module('phoneBookApp.contacts', ['ngRoute', 'ngAnimate'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/contacts', {
            templateUrl: 'contacts/contacts.html',
            controller: 'contactsCtrl'
        });
        $routeProvider.when('/contact-form', {
            templateUrl: 'contacts/contact-form.html',
            controller: 'contactsCtrl'
        });
    }])

    .controller('contactsCtrl', ['$scope', 'handleContact', '$location', function($scope, handleContact, $location) {
        $scope.Contact = function() {
            return {
                contactImg: "../resources/profileman.png",
                properties: [
                    {
                        propType: $scope.propertyTypes[0],
                        propVal: "",

                    }
                ]
            };
        };

        /* variables */
        $scope.propertyTypes = ['Mobile', 'Home', 'Work', 'E-Mail', 'Address', 'Other'];
        $scope.contacts = handleContact.getContactsAsList(true);
        $scope.pinList = handleContact.getPinList();
        $scope.contactDisplay = false;
        $scope.contactExists = false;
        $scope.editMode = false;
        $scope.isFilled = true;
        $scope.activeContact = $scope.Contact();
        $scope.editContact = $scope.Contact();
        $scope.activeProperties = [];
        $scope.activeImg = "../resources/profileman.png";
        $scope.newContact = $scope.Contact();

        // function to display the contact on the right
        $scope.displayContact = function(contact) {
            $scope.activeContact = contact;
            $scope.activeProperties = $scope.activeContact.properties;
            $scope.activeImg = $scope.activeContact.contactImg;
            $scope.contactDisplay = true;
        };

        // enter edit mode of the displayed contact
        $scope.edit = function() {
            $scope.editMode = true;
            $scope.editContact = handleContact.copyContact($scope.activeContact);
            $scope.activeProperties = $scope.editContact.properties;
            $scope.activeImg = $scope.editContact.contactImg;
        };

        // close edit/display window
        $scope.closeDisplay = function() {
            $scope.editMode = false;
            $scope.contactDisplay = false;
            $scope.editContact = null;
            $scope.activeProperties = [];
        };

        // close the create contact form
        $scope.closeForm = function() {
            $location.path( "/contacts" );
            $scope.newContact = $scope.Contact();
        };

        // check if the contact that user wants to create not exists
        $scope.checkIfExists = function() {
            if($scope.editMode && !$scope.checkIfActiveChanged())
                return false;

            var contact = $scope.editMode ? $scope.editContact : $scope.newContact;

            if(handleContact.checkIfExists(contact))
                return true;
        };

        // check if the editContact is the same as activeContact
        $scope.checkIfActiveChanged = function() {
            return handleContact.getKey($scope.editContact) !== handleContact.getKey($scope.activeContact);
        };

        // function to add contact info to the contact form or to the edit form
        $scope.addPropertyForm = function() {
            var properties = $scope.editMode ? $scope.activeProperties : $scope.newContact.properties;
            var index = properties.length;
            properties.push({propType: $scope.propertyTypes[0], propVal: ""});
            $scope.addValidation(index, $scope.propertyTypes[0]);
        };

        // remove contact info fields from the form
        $scope.removePropertyForm = function(index) {
            $scope.editMode ? $scope.activeProperties.splice(index, 1) : $scope.newContact.properties.splice(index, 1);
        };

        //remove empty contact info from properties array
        $scope.removeEmptyInfo = function(properties) {
            for(var i = 0; i < properties.length; i++) {
                if(!properties[i].propVal || properties[i].propVal === "") {
                    properties.splice(i, 1);
                    i--;
                }

            }
        };

        // check that at least one contact info is filled
        $scope.isPropertyFilled = function(properties) {
            for (var i = 0; i < properties.length; i++) {
                if(properties[i].propVal)
                    return true;
            }
            return false;
        };


        // delete contact from edit mode
        $scope.deleteContact = function () {
            handleContact.deleteContact(handleContact.getKey($scope.activeContact));
            handleContact.deleteContact(handleContact.getKey($scope.activeContact));
            //todo: alert of deletion and confirmation
            $scope.activeContact = $scope.Contact();
            $scope.editContact = $scope.Contact();
            $scope.contactDisplay = false;
            $scope.editMode =false;
            $scope.contacts = handleContact.getContactsAsList(true);
            $scope.pinList = handleContact.getPinList();
        };

        // function to handle pictures
        $scope.readURL = function(input)
        {
            if (input.files && input.files[0]) {
                var reader = new FileReader();

                reader.onload = function (e) {
                    if($scope.editMode) {
                        var conImg = document.getElementById('contact-image-edit');
                        conImg.src =  e.target.result;
                        $scope.editContact.contactImg = this.result/*"data:image/png;base64," + getImageURL(conImg);*/
                    }
                    else {
                        var conImg = document.getElementById('contact-image');
                        conImg.src =  e.target.result;
                        $scope.newContact.contactImg = this.result/*"data:image/png;base64," + getImageURL(conImg);*/
                    }
                };
                reader.readAsDataURL(input.files[0]);
            }
        };

        // add a new contact redirect to contact-form
        $scope.addContact = function() {
            $location.path( "/contact-form" );
        };

        // delete all contacts
        $scope.deleteAllContacts = function() {
            //todo: confirmation
            handleContact.deleteStorage();
            $scope.contacts = handleContact.getContactsAsList(true);
            $scope.pinList = handleContact.getPinList();
            $scope.contactDisplay = false;
            $scope.editMode = false;
        };

        $scope.pinContact = function(contact) {
            handleContact.addPin(handleContact.getKey(contact));
            $scope.contacts = handleContact.getContactsAsList(true);
            $scope.pinList = handleContact.getPinList();
        };

        $scope.removeContactPin = function(contact) {
            handleContact.removePin(handleContact.getKey(contact));
            $scope.contacts = handleContact.getContactsAsList(true);
            $scope.pinList = handleContact.getPinList();
        };

        // save contact to local storage if valid
        $scope.submit = function(invalid) {
            var contact = $scope.editMode ? $scope.editContact : $scope.newContact;
            $scope.removeEmptyInfo(contact.properties);
            $scope.isFilled = $scope.isPropertyFilled(contact.properties);

            if(!invalid && $scope.isFilled) {

                if($scope.checkIfExists()) {
                    $scope.contactExists = true;
                    return;
                }

                $scope.contactExists = false;

                if($scope.editMode) {
                    if($scope.checkIfActiveChanged()) {
                        handleContact.deleteContact(handleContact.getKey($scope.activeContact));
                        handleContact.saveContact(handleContact.getKey(contact), contact);
                    } else {
                        handleContact.updateContact(handleContact.getKey(contact), contact);
                    }
                    $scope.activeContact = $scope.editContact;
                    $scope.contactDisplay = true;
                    $scope.activeImg = $scope.activeContact.contactImg;
                    $scope.editMode = false;
                } else {
                    handleContact.saveContact(handleContact.getKey(contact), contact);
                    $location.path( "#!/contacts" );
                    $scope.contactDisplay = false;
                }
                $scope.contacts = handleContact.getContactsAsList(true);
                $scope.pinList = handleContact.getPinList();
            }
        }
    }]);

function getImageURL(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}
