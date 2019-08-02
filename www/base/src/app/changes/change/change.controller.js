class ChangeController {
    constructor($rootScope, $scope, $location, dataService, bbSettingsService) {
        
    }
}

angular.module('app')
.controller('changeController', ['$rootScope', '$scope', '$location', 'dataService', 'bbSettingsService', ChangeController])