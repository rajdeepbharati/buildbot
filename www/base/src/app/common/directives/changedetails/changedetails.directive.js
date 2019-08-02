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

        $scope.builds = dataAccessor.getBuilds({limit: buildsFetchLimit});

        $scope.getBuilder = function(builderid) {
            if ($scope.builders == null) {
                $scope.builders = dataAccessor.getBuilders({limit: buildersFetchLimit});
            }
            for (const builder of $scope.builders) {
                if (builderid === builder.builderid) {
                    return builder;
                }
            }
        }

        $scope.setLocation = function(sd) {
            if (!sd) {
                $location.search({});
            } else {
                $location.search('id', $scope.change.changeid);
            }
        }

        $scope.$watch('change', function(change) {
            if (change.changeid == $location.search()['id']) {
                change.show_details = true;
                change.builds = change.getBuilds({limit: buildsFetchLimit});
                change.buildsArray = [];
                change.buildersArray = [];

                change.builds.onNew = (build) => {
                    change.buildsArray.push(build);
                    change.buildersArray.push($scope.getBuilder(build.builderid));
                }
            }
        });

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
