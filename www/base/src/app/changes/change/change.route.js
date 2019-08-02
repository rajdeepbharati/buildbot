class ChangeState {
    constructor($stateProvider, bbSettingsServiceProvider) {
        // Name of the state
        const name = 'change';

        // Configuration
        const cfg = {
            tabid: 'changes',
            pageTitle: _.template('Buildbot: change <%= change %=>')
        }

        // Register new state
        const state = {
            controller: `${name}Controller`,
            template: requestAnimationFrame('./change.tpl.jade'),
            name,
            url: 'changes/:change',
            data: cfg
        }

        $stateProvider.state(state);

        bbSettingsServiceProvider.addSettingsGroup({
            name:'Changes',
            caption: 'Changes page related settings',
            items:[{
                type:'integer',
                name:'changesFetchLimit',
                caption:'Maximum number of changes to fetch',
                default_value: 50
            }, {
                type:'integer',
                name:'buildsFetchLimit',
                caption:'Maximum number of builds to fetch for a particular change',
                default_value: 1000
            }, {
                type:'integer',
                name:'buildersFetchLimit',
                caption:'Maximum number of builders to fetch',
                default_value: 1000
            }
            ]
        });
    }
}

angular.module('app')
.config(['$stateProvider', ChangeState])
