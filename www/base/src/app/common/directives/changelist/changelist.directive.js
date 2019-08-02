/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class Changelist {
    constructor() {
        return {
            replace: true,
            restrict: 'E',
            scope: {changes: '=?'},
            template: require('./changelist.tpl.jade'),
            controller: '_changeListController'
        };
    }
}

class _changeList {
    constructor($scope, dataUtilsService, $location, $rootScope,
        dataService, bbSettingsService) {

        $scope.settings = bbSettingsService.getSettingsGroup("Changes");
        $scope.$watch('settings', () => bbSettingsService.save()
        , true);
        const buildsFetchLimit = $scope.settings.buildsFetchLimit.value;
        const buildersFetchLimit = $scope.settings.buildersFetchLimit.value;
        const dataAccessor = dataService.open().closeOnDestroy($scope);

        $scope.builds = dataAccessor.getBuilds({limit: buildsFetchLimit});
        $scope.builds.onNew = (build) => {
            getBuildsForChange();
        }

        const getBuilder = function(builderid) {
            if ($scope.builders == null) {
                $scope.builders = dataAccessor.getBuilders({limit: buildersFetchLimit});
            }
            for (const builder of $scope.builders) {
                if (builderid === builder.builderid) {
                    return builder;
                }
            }
        }

        const getBuildsForChange = function() {
            Array.from($scope.changes).map((change) => {
                if (change.changeid == $location.search()['id']) {
                    change.show_details = true;
                    change.builds = change.getBuilds({limit: buildsFetchLimit});
                    change.buildsArray = [];
                    change.buildersArray = [];
                    change.builds.onNew = (build) => {
                        change.buildsArray.push(build);
                        change.buildersArray.push(getBuilder(build.builderid));
                    }
                }
            });
        }

        $rootScope.$on('$locationChangeSuccess', getBuildsForChange);

        $scope.expandDetails = () => {
            Array.from($scope.changes).map(change => {
                change.show_details = true;
                change.builds = change.getBuilds({limit: buildsFetchLimit});
                change.buildsArray = [];
                change.buildersArray = [];
                change.builds.onNew = (build) => {
                    change.buildsArray.push(build);
                    change.buildersArray.push(getBuilder(build.builderid));
                }
            });
        }

        $scope.collapseDetails = () => {
            Array.from($scope.changes).map(change => {
                change.show_details = false;
                $location.search({});
            });
        }
    }
}


angular.module('common')
.directive('changelist', [Changelist])
.controller('_changeListController', ['$scope', 'dataUtilsService', '$location', '$rootScope', 'dataService', 'bbSettingsService', _changeList]);
