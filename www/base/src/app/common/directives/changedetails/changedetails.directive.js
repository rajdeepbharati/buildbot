class Changedetails {
    constructor() {
        return {
            replace: true,
            restrict: 'E',
            scope: {
                change: '=',
                compact: '=?'
            },
            template: require('./changedetails.tpl.jade'),
            controller: '_changeDetailsController'
        };
    }
}

class _changeDetails {
    constructor($scope, dataUtilsService, $location, $rootScope,
        dataService, bbSettingsService) {

        $scope.settings = bbSettingsService.getSettingsGroup("Changes");
        $scope.$watch('settings', () => bbSettingsService.save()
        , true);
        const buildsFetchLimit = $scope.settings.buildsFetchLimit.value;
        const buildersFetchLimit = $scope.settings.buildersFetchLimit.value;
        const changesFetchLimit = $scope.settings.changesFetchLimit.value;

        const dataAccessor = dataService.open().closeOnDestroy($scope);

        $scope.changes = dataAccessor.getChanges({limit: changesFetchLimit, order: '-changeid'});
        // $scope.changes.onNew = function(change) {
        //     // console.log($scope.changes.length);
        //     // console.log(change)
        //     change.builds = change.getBuilds({limit: 100});
        //     change.builds.onNew = (build) => {
        //         console.log(change.builds.length)
        //     }
        // }
        $scope.builders = dataAccessor.getBuilders({limit: buildersFetchLimit});

        // $scope.buildersArray = [];
        // $scope.builders.onNew = (builder) => {
        //     $scope.buildersArray.push(builder);
        // }
        // console.log($scope.buildersArray)

        $scope.getBuilder = function(builderid) {
            for (const builder of $scope.builders) {
                if (builderid === builder.builderid) {
                    return builder;
                }
            }
        }

        $scope.expandChange = function(change) {
            if (change.changeid == $location.search()['id']) {
                console.log('dc', change);
                change.show_details = true;
            }
        }

        $scope.setLocation = function(sd) {
            if (!sd) {
                $location.search({});
            } else {
                $location.search('id', $scope.change.changeid);
            }
        }

        $scope.getResult = function(b) {
            let result;
            if (!b.complete && b.started_at >= 0) {
                result = 'PENDING';
            } else {
                switch (b.results) {
                    case 0: result = 'SUCCESS'; break;
                    case 1: result = 'WARNINGS'; break;
                    case 2: result = 'FAILURE'; break;
                    case 3: result = 'SKIPPED'; break;
                    case 4: result = 'EXCEPTION'; break;
                    case 5: result = 'CANCELLED'; break;
                    default: result = 'CANCELLED';
                }
            }
            return 'results_' + result;
        }
    }
}


angular.module('common')
.directive('changedetails', [Changedetails])
.controller('_changeDetailsController', ['$scope', 'dataUtilsService', '$location', '$rootScope', 'dataService', 'bbSettingsService', _changeDetails]);
