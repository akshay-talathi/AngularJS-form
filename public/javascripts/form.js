 module = angular.module('app', []);

 module.directive('showErrors', function($timeout, showErrorsConfig) {
     var getShowSuccess, linkFn;
     getShowSuccess = function(options) {
         var showSuccess;
         showSuccess = showErrorsConfig.showSuccess;
         if (options && options.showSuccess != null) {
             showSuccess = options.showSuccess;
         }
         return showSuccess;
     };
     linkFn = function(scope, el, attrs, formCtrl) {
         var blurred, inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses;
         blurred = false;
         options = scope.$eval(attrs.showErrors);
         showSuccess = getShowSuccess(options);
         inputEl = el[0].querySelector('[name]');
         inputNgEl = angular.element(inputEl);
         inputName = inputNgEl.attr('name');
         if (!inputName) {
             throw 'show-errors element has no child input elements with a \'name\' attribute';
         }
         inputNgEl.bind('blur', function() {
             blurred = true;
             return toggleClasses(formCtrl[inputName].$invalid);
         });
         scope.$watch(function() {
             return formCtrl[inputName] && formCtrl[inputName].$invalid;
         }, function(invalid) {
             if (!blurred) {
                 return;
             }
             return toggleClasses(invalid);
         });
         scope.$on('show-errors-check-validity', function() {
             return toggleClasses(formCtrl[inputName].$invalid);
         });
         scope.$on('show-errors-reset', function() {
             return $timeout(function() {
                 el.removeClass('has-error');
                 el.removeClass('has-success');
                 return blurred = false;
             }, 0, false);
         });
         return toggleClasses = function(invalid) {
             el.toggleClass('has-error', invalid);
             if (showSuccess) {
                 return el.toggleClass('has-success', !invalid);
             }
         };
     };
     return {
         restrict: 'A',
         require: '^form',
         compile: function(elem, attrs) {
             if (!elem.hasClass('form-group')) {
                 throw 'show-errors element does not have the \'form-group\' class';
             }
             return linkFn;
         }
     };
 });

 module.provider('showErrorsConfig', function() {
     var _showSuccess;
     _showSuccess = false;
     this.showSuccess = function(showSuccess) {
         return _showSuccess = showSuccess;
     };
     this.$get = function() {
         return {
             showSuccess: _showSuccess
         };
     };
 });

 module.controller('NewUserController', function($scope, $http) {
     $scope.save = function() {
         $scope.$broadcast('show-errors-check-validity');

         if ($scope.userForm.$valid) {
             alert('User saved ! Thank You');
             $http.post('/add', {
                 user: $scope.user
             });
             $scope.reset();
         }
     };

     $scope.reset = function() {
         $scope.$broadcast('show-errors-reset');
         $scope.user = {
             name: '',
             email: '',
             address: '',
             phone: '',
             streetName: '',
             streetNumber: '',
             country: '',
             city: '',
             zipCode: ''
         };
     }
 });

 module.directive("ngAddressAutocomplete", function() {
     return {
         restrict: "EA",
         scope: {
             ngModel: "=",
             city: "=",
             zipCode: "=",
             country: "=",
             streetName: "=",
             streetNumber: "="
         },
         link: function(scope, element, attrs) {
             var autocomplete = new google.maps.places.Autocomplete(element[0]);
             google.maps.event.addListener(autocomplete, 'place_changed', function() {
                 var place = autocomplete.getPlace();

                 if (!scope.$$phase) scope.$apply(function() {
                     var componenents = place.address_components || [];
                     for (var i = 0; i < componenents.length; i++) {
                         var item = componenents[i];
                         if (item && item.types) {
                             if (/route/gi.test(item.types[0])) {
                                 scope.streetName = componenents[1].long_name;
                             }
                             if (/country/gi.test(item.types[0])) {
                                 scope.country = item.long_name;
                             }
                             if (/street_number/gi.test(item.types[0])) {
                                 scope.streetNumber = item.long_name;
                             }
                             if (/postal_code/gi.test(item.types[0])) {
                                 scope.zipCode = item.long_name;
                             }
                             if (/dministrative_area_level_2|city/gi.test(item.types[0])) {
                                 scope.city = item.long_name;
                             }
                         }
                     }
                 });
             })
         }
     }
 });