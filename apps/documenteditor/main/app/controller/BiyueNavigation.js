/*
 * (c) Copyright Ascensio System SIA 2010-2023
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */
/**
 * chongxishen
 */

define([
    'core',
    'documenteditor/main/app/collection/BiyueNavigation',
    'documenteditor/main/app/view/BiyueNavigation'
], function () {
    'use strict';

    DE.Controllers.BiyueNavigation = Backbone.Controller.extend(_.extend({
        models: [],
        collections: [
            'BiyueNavigation'
        ],
        views: [
            'BiyueNavigation'
        ],

        initialize: function() {
            var me = this;
            this.addListeners({
                'BiyueNavigation': {
                    'show': function() {
                        if (me.api) me.api.sync_OnDocBiyueLevelUpdate();
                    },
                    'hide': function() {
                        // if (!this.canUseViwerNavigation) {
                        //     me.api && me.api.asc_HideDocumentOutline();
                        // }
                    }
                }
            });
        },

        events: function() {
        },

        onLaunch: function() {
            this.panelNavigation= this.createView('BiyueNavigation', {
                storeNavigation: this.getApplication().getCollection('BiyueNavigation')
            });
            this.panelNavigation.on('render:after', _.bind(this.onAfterRender, this));
            this._navigationObject = null;
            this._viewerNavigationObject = null;
            this._isDisabled = false;
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onDocBiyueLevelUpdate', _.bind(this.onDocBiyueLevelUpdate, this));
            return this;
        },

        setMode: function(mode) {
            this.mode = mode;
            this.canUseViwerNavigation = this.mode.canUseViwerNavigation;
            if (this.panelNavigation && this.panelNavigation.viewNavigationList) {
                this.panelNavigation.viewNavigationList.setEmptyText(this.mode.isEdit ? this.panelNavigation.txtEmpty : this.panelNavigation.txtEmptyViewer);
                this.panelNavigation.viewNavigationList.enableKeyEvents = !this.mode.isEdit && !this.mode.isRestrictedEdit;
            }
            return this;
        },

        onAfterRender: function(panelNavigation) {
            panelNavigation.viewNavigationList.on('item:click', _.bind(this.onSelectItem, this));
            panelNavigation.viewNavigationList.on('item:contextmenu', _.bind(this.onItemContextMenu, this));
            panelNavigation.viewNavigationList.on('item:add', _.bind(this.onItemAdd, this));
            panelNavigation.navigationMenu.on('item:click',           _.bind(this.onMenuItemClick, this));
            panelNavigation.navigationMenu.items[11].menu.on('item:click', _.bind(this.onMenuLevelsItemClick, this));
            panelNavigation.btnClose.on('click', _.bind(this.onClickClosePanel, this));

            var viewport = this.getApplication().getController('Viewport').getView('Viewport');
            viewport.hlayout.on('layout:resizedrag',  function () {
                if (panelNavigation.viewNavigationList && panelNavigation.viewNavigationList.scroller)
                    panelNavigation.viewNavigationList.scroller.update({alwaysVisibleY: true});
            });
        },

        // TEST
        onDocBiyueLevelUpdate: function() {
            var allTracks = this.api.asc_GetBlockStdTracks();
            if (allTracks && allTracks.length > 0) {
                var arr = [];
                arr.push(new Common.UI.TreeViewModel({
                    name : allTracks[0].name,
                    level: 1,
                    index: 0,
                    hasParent: false,
                    hasSubItems: true,
                    isEmptyItem: false
                }));
                for (var i = 1; i < allTracks.length; i++) {
                    var track = allTracks[i];
                    if (track.parent) continue;
                    arr.push(new Common.UI.TreeViewModel({
                        name : track.name,
                        level: 2,
                        index: i,
                        hasParent: true,
                        hasSubItems: false,
                        isEmptyItem: false
                    }));
                }

                var store = this.getApplication().getCollection('BiyueNavigation');
                store.reset(arr);
            }
        },
        
        onItemContextMenu: function(picker, item, record, e) {
            var menu = this.panelNavigation.navigationMenu;
            if (menu.isVisible()) {
                menu.hide();
            }

            var parentOffset = this.panelNavigation.$el.offset(),
                top = e.clientY*Common.Utils.zoom();
            var showPoint = [e.clientX*Common.Utils.zoom() + 5, top - parentOffset.top + 5];

            for (var i=0; i<7; i++) {
                menu.items[i].setVisible(this.mode.isEdit);
            }

            menu.items[7].setVisible(!this.canUseViwerNavigation);
            menu.items[8].setVisible(!this.canUseViwerNavigation);

            var isNotHeader = record.get('isNotHeader');
            menu.items[0].setDisabled(isNotHeader || this._isDisabled);
            menu.items[1].setDisabled(isNotHeader || this._isDisabled);
            menu.items[3].setDisabled(isNotHeader || this._isDisabled);
            menu.items[4].setDisabled(this._isDisabled);
            menu.items[5].setDisabled(this._isDisabled);
            menu.items[7].setDisabled(isNotHeader);

            if (showPoint != undefined) {
                var menuContainer = this.panelNavigation.$el.find('#menu-biyue-navigation-container');
                if (!menu.rendered) {
                    if (menuContainer.length < 1) {
                        menuContainer = $('<div id="menu-biyue-navigation-container" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id);
                        $(this.panelNavigation.$el).append(menuContainer);
                    }
                    menu.render(menuContainer);
                    menu.cmpEl.attr({tabindex: "-1"});
                }
                menu.cmpEl.attr('data-value', record.get('index'));
                menuContainer.css({
                    left: showPoint[0],
                    top: showPoint[1]
                });
                menu.show();
                _.delay(function() {
                    menu.cmpEl.focus();
                }, 10);
            }

        },

        onSelectItem: function(picker, item, record, e) {
            if (this.api) {
                var allTracks = this.api.asc_GetBlockStdTracks();
                this.api.asc_Goto(allTracks[record.get('index')]);
            }
        },

        onItemAdd: function(picker, item, record, e){
            record.set('dataItem', item);
        },

        onMenuItemClick: function (menu, item) {
            if (!this._navigationObject && !this._viewerNavigationObject) return;
            var index = parseInt(menu.cmpEl.attr('data-value'));
            if (item.value == 'promote') {
                this._navigationObject.promote(index);
            } else if (item.value == 'demote') {
                this._navigationObject.demote(index);
            } else if (item.value == 'before') {
                this._navigationObject.insertHeader(index, true);
            } else if (item.value == 'after') {
                this._navigationObject.insertHeader(index, false);
            } else if (item.value == 'new') {
                this._navigationObject.insertSubHeader(index);
            } else if (item.value == 'select') {
                this._navigationObject.selectContent(index);
            } else if (item.value == 'expand') {
                this.panelNavigation.viewNavigationList.expandAll();
            } else  if (item.value == 'collapse') {
                this.panelNavigation.viewNavigationList.collapseAll();
            }
        },
        onClickClosePanel: function() {
            Common.NotificationCenter.trigger('leftmenu:change', 'hide');
        },

        onMenuSettingsItemClick: function (menu, item) {
            switch (item.value) {
                case 'expand':
                    this.panelNavigation.viewNavigationList.expandAll();
                    break;
                case 'collapse':
                    this.panelNavigation.viewNavigationList.collapseAll();
                    break;
                case 'wrap':
                    this.panelNavigation.changeWrapHeadings();
                    break;
            }
        },

        onMenuLevelsItemClick: function (menu, item) {
            this.panelNavigation.viewNavigationList.expandToLevel(item.value-1);
        },

        onMenuFontSizeClick: function (menu, item) {
            this.panelNavigation.changeFontSize(item.value);
        },

        SetDisabled: function(state) {
            this._isDisabled = state;
        },

        txtBeginning: 'Beginning of document',
        txtGotoBeginning: 'Go to the beginning of the document'

    }, DE.Controllers.BiyueNavigation || {}));
});
