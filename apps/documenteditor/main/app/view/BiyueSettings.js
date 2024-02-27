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
 *  BiyueSettings.js
 * 
 *  @refer HeaderFooterSettings
 *
 *  Created by chongxishen
 *
 */

define([
    'text!documenteditor/main/app/template/BiyueSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Button',
    'common/main/lib/component/MetricSpinner',
    'common/main/lib/component/CheckBox',
    'common/main/lib/component/RadioBox'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    DE.Views.BiyueSettings = Backbone.View.extend(_.extend({
        el: '#id-biyue-settings',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        options: {
            alias: 'BiyueSettings'
        },

        initialize: function () {
            this._initSettings = true;

            this._state = {
                ShowCC: false,
                DiffOdd: false,
                DisabledControls: false,
                BiyueConfig: null,
            };
            this.lockedControls = [];
            this._locked = false;

            this.render();
        },

        render: function () {
            var el = this.$el || $(this.el);
            el.html(this.template({
                scope: this
            }));
        },

        setApi: function(api) {
            this.api = api;
            this._state.BiyueConfig = api.asc_GetBiyueConfig();
            this.api.asc_registerCallback('asc_onDocBiyueContentControlUpdate', _.bind(this.onDocBiyueContentControlUpdate, this));
            return this;
        },

        onDocBiyueContentControlUpdate: function() {
            if (this._state.BiyueConfig) {
                if (this._state.BiyueConfig.showContentControls) {
                    this.api.asc_showContentControls({show: true});
                }
            }
        },

        ChangeSettings: function(prop) {
            if (this._initSettings)
                this.createDelayedElements();

            this.disableControls(this._locked);

            if (this._state.BiyueConfig) {
                var value = this._state.BiyueConfig.showContentControls;
                if (this._state.ShowCC !== value) {
                    this.chShowCC.setValue(value, true);
                    this._state.ShowCC = value;
                }
            }
        },

        onShowCCChange: function(field, newValue, oldValue, eOpts) {
            const show = field.getValue() == 'checked';
            if (this.api) {
                this.api.asc_showContentControls({show: show});
            }
            this.fireEvent('editcomplete', this);
        },

        createDelayedControls: function() {
            var me = this;
            this.chShowCC = new Common.UI.CheckBox({
                el: $('#biyue-check-show-cc'),
                labelText: this.textShowContentControls,
                dataHint: '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            this.lockedControls.push(this.chShowCC);

            this.chShowCC.on('change', _.bind(this.onShowCCChange, this));
        },
        
        createDelayedElements: function() {
            this.createDelayedControls();
            this._initSettings = false;
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        disableControls: function(disable) {
            if (this._initSettings) return;
            
            if (this._state.DisabledControls !== disable) {
                this._state.DisabledControls = disable;
                _.each(this.lockedControls, function(item) {
                    item.setDisabled(disable);
                });
            }
        },

        textOptions:                '选项',
        textShowContentControls:    '显示文本控制块',
    }, DE.Views.BiyueSettings || {}));
});