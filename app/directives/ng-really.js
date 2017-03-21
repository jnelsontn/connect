'use strict';

/*
 * Usage: Add attributes: ng-really-message="Are you sure"? ng-really-click="takeAction()" function
 * From: http://stackoverflow.com/questions/18313576/confirmation-dialog-on-ng-click-angularjs
 */
app.directive('ngConfirmClick', [ function() {
    return {
        link: (scope, element, attr) => {
            let msg = attr.ngConfirmClick || "Are you sure?";
            let clickAction = attr.confirmedClick;
            element.bind('click', () => {
                if ( window.confirm(msg) ) {
                    scope.$eval(clickAction);
                }
            });
        }
    };
}]);