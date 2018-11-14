angular.module("phoneBookApp")
    .service('handleContact', ['localStorageService', function(localStorageService) {

        var self = this;

        //save a new contact to contacts
        self.saveContact = function (key, contact) {
            var contacts = localStorageService.get('contacts');
            if (!contacts) {
                var contactsObj = {};
                contactsObj[key] = contact;
                return self.setToStorage('contacts', contactsObj);
            } else {
                if(contacts[key])
                    return "EXISTS";
                else {
                    contacts[key] = contact;
                    localStorageService.remove("contacts");
                    return self.setToStorage('contacts', contacts);
                }
            }
        };

        // get a specific contact by a given key
        self.getContact= function (key)
        {
            var contacts = localStorageService.get('contacts');
            if(contacts) {
                if(contacts[key])
                    return contacts[key];
                else
                    return "NOT EXISTS";
            }
            return "FAIL";
        };

        // get contacts object
        self.getContactsAsMap = function() {
            return localStorageService.get('contacts') ? localStorageService.get('contacts') : {};
        };

        // get contacts list
        self.getContactsAsList = function (sorted) {
            var contacts = localStorageService.get('contacts');
            if(!contacts)
                return [];
            var contactsList = Object.values(contacts);
            if(sorted) {
                contactsList = contactsList.sort(function(contact1, contact2) {
                    var contact1Key = self.getKey(contact1);
                    var contact2Key= self.getKey(contact2);
                    return (contact1Key < contact2Key) ? -1 : (contact1Key > contact2Key) ? 1 : 0;
                })
            }
            return contactsList;
        };

        // change a given contact
        self.updateContact = function (key,contact)
        {
            var result = self.saveContact(key);
            if(result === "EXISTS") {
                var contacts = localStorageService.get('contacts');
                contacts[key] = contact;
                localStorageService.remove("contacts");
                return self.setToStorage('contacts', contacts);
            } else
                return "NOT EXISTS";
        };

        // delete local storage
        self.deleteStorage = function ()
        {
            localStorageService.remove("contacts");
            localStorageService.remove("pinList");
        };

        // delete a specific contact of a given key from the contacts
        self.deleteContact = function(key) {
            var contacts = localStorageService.get('contacts');

            if(contacts[key])
                delete contacts[key];
            else
                return "NOT EXISTS";

            localStorageService.remove("contacts");
            return self.setToStorage('contacts', contacts);
        };

        // get the pin contacts list
        self.getPinList = function() {
            return localStorageService.get('pinList') ? localStorageService.get('pinList') : [];
        };

        // add an existing contact to the pin list and remove it from the contacts list
        self.addPin = function(key) {
            var contact = self.getContact(key);
            self.deleteContact(key);
            var pinList = self.getPinList() ? self.getPinList() : [];
            if(pinList.length > 0)
                localStorageService.remove('pinList');
            pinList.push(contact);
            return self.setToStorage('pinList', pinList);
        };

        // remove a given contact from the pin list and add it back to the contacts list
        self.removePin = function(key) {
            var contact = {};
            var pinList = self.getPinList();
            for (var i=0; i < pinList.length; i++) {
                if (self.getKey(pinList[i]) === key) {
                    contact = pinList[i];
                    pinList.splice(i, 1);
                    break;
                }
            }
            self.saveContact(key, contact);
            localStorageService.remove('pinList');
            return self.setToStorage('pinList', pinList);
        };

        // function to get a key from a given contact
        self.getKey = function(contact) {
            return contact.firstName + ' ' + contact.lastName;
        };

        // set content safely to local storage
        self.setToStorage = function(key, value) {
            if (localStorageService.set(key, value))
                return "SUCCESS";
            else
                return "FAIL";
        };

        // return a copy of a given contact object
        self.copyContact = function(contact) {
            var newContact = {
                firstName: contact.firstName,
                lastName: contact.lastName,
                properties: []
            };
            for(var i = 0; i < contact.properties.length; i++) {
                var property = {
                    propType: contact.properties[i].propType,
                    propVal: contact.properties[i].propVal
                };
                newContact.properties.push(property);
            }
            newContact["contactImg"] = contact["contactImg"];
            return newContact;
        };

        // return true if contact is already exists in local storage
        self.checkIfExists = function(contact) {
            var contacts = self.getContactsAsMap();
            var pin = self.getPinList();
            var contactKey = self.getKey(contact);

            // check in contacts
            if(contactKey in contacts)
                return true;

            // check in pinned list
            for(var i = 0; i < pin.length; i++) {
                if (self.getKey(pin[i]) === contactKey) {
                    return true;
                }
            }

            return false;
        }
    }]);