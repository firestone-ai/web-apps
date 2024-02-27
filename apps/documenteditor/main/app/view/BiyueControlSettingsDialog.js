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
 *  BiyueControlSettingsDialog.js
 *
 *  @refer ControlSettingsDialog
 * 
 *  Created by chongxishen
 *
 */

define([ 'text!documenteditor/main/app/template/BiyueControlSettingsDialog.template',
    'common/main/lib/util/utils',
    'common/main/lib/component/CheckBox',
    'common/main/lib/component/InputField',
    'common/main/lib/view/AdvancedSettingsWindow',
    'common/main/lib/view/SymbolTableDialog',
    'documenteditor/main/app/view/EditListItemDialog'
], function (contentTemplate) { 'use strict';

    DE.Views.BiyueControlSettingsDialog = Common.Views.AdvancedSettingsWindow.extend(_.extend({
        options: {
            contentWidth: 310,
            height: 405,
            toggleGroup: 'biyue-control-adv-settings-group',
            storageName: 'de-biyue-control-settings-adv-category'
        },

        quesTypes: [
            { display: '未定义',    value: 0,           color: 'DCDCDC' },
            { display: '单选',      value: 1,           color: '993366' },
            { display: '填空',      value: 2,           color: 'C0C0C0' },
            { display: '作答',      value: 3,           color: 'FF99CC' },
            { display: '判断',      value: 4,           color: 'FFCC99' },
            { display: '多选',      value: 5,           color: 'FFFF99' },
            { display: '文本',      value: 6,           color: 'CCFFCC' },
            { display: '单选组合',  value: 7,           color: 'CCFFFF' },
            { display: '作文',      value: 8,           color: 'C9C8FF' },
            { display: '结构',      value: 1000,        color: 'CC99FF' },
            { display: '作答区',    value: 1001,        color: 'CC00FF' },
        ],

        initialize : function(options) {
            _.extend(this.options, {
                title: this.textTitle,
                items: [
                    {panelId: 'id-adv-biyue-control-settings-general', panelCaption: this.strGeneral},
                ],
                contentTemplate: _.template(contentTemplate)({
                    scope: this
                })
            }, options);

            this.handler    = options.handler;
            this.props      = options.props;
            this.api        = options.api;

            Common.Views.AdvancedSettingsWindow.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.Views.AdvancedSettingsWindow.prototype.render.call(this);
            var me = this;
            this.quesType = new Common.UI.ComboBox({
                el: $('#biyue-control-settings-combo-ques-type'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 120px;',
                editable: false,
                takeFocusOnClose: true,
                data: [
                    { displayValue: me.quesTypes[0].display,             value: me.quesTypes[0].value },
                    { displayValue: me.quesTypes[1].display,             value: me.quesTypes[1].value },
                    { displayValue: me.quesTypes[2].display,             value: me.quesTypes[2].value },
                    { displayValue: me.quesTypes[3].display,             value: me.quesTypes[3].value },
                    { displayValue: me.quesTypes[4].display,             value: me.quesTypes[4].value },
                    { displayValue: me.quesTypes[5].display,             value: me.quesTypes[5].value },
                    { displayValue: me.quesTypes[6].display,             value: me.quesTypes[6].value },
                    { displayValue: me.quesTypes[7].display,             value: me.quesTypes[7].value },
                    { displayValue: me.quesTypes[8].display,             value: me.quesTypes[8].value },
                    { displayValue: me.quesTypes[9].display,             value: me.quesTypes[9].value },
                    { displayValue: me.quesTypes[10].display,            value: me.quesTypes[10].value },
                ]
            });
            this.quesType.on('selected', _.bind(function(combo, data) { me.updateQuesType(data.value); }, this));
            this.afterRender();
        },

        updateQuesType: function(val) {
            for (let i = 0, N = this.quesTypes.length; i < N; i++) {
                let item = this.quesTypes[i];
                if (item.value === val) {
                    var span = $('#biyue-control-settings-color-span');
                    span.css({'background-color': '#' + item.color});
                    break;
                }
            }
        },

        getFocusedComponents: function() {
            return [
                this.quesType, // 0 tab
            ];
        },

        onCategoryClick: function(btn, index) {
            Common.Views.AdvancedSettingsWindow.prototype.onCategoryClick.call(this, btn, index);
        },

        afterRender: function() {
            this.updateMetricUnit();
            this._setDefaults(this.props);
            if (this.storageName) {
                var value = Common.localStorage.getItem(this.storageName);
                this.setActiveCategory((value!==null) ? parseInt(value) : 0);
            }
        },

        show: function() {
            Common.Views.AdvancedSettingsWindow.prototype.show.apply(this, arguments);
        },

        setQuesType: function(type) {
            this.quesType.setValue(type);
            this.updateQuesType(type);
        },

        getColorByType: function(type) {
            for (let i = 0, N = this.quesTypes.length; i < N; i++) {
                let item = this.quesTypes[i];
                if (item.value === type) {
                    return item.color;
                }
            }
            return this.quesTypes[0].color;
        },

        _setDefaults: function (props) {
            if (props) {
                var quesType = 0;
                var tag = props.get_Tag();                
                try {
                    var val = JSON.parse(tag);
                    if (val && val.type) quesType = val.type;
                } catch (e) { }
                this.setQuesType(quesType);

                var c = this.getColorByType(quesType);
                var color = Common.Utils.ThemeColor.getRgbColor(c);
                props.put_Color(color.get_r(), color.get_g(), color.get_b());
            }
        },

        getSettings: function () {
            var props   = new AscCommon.CContentControlPr();

            var type = this.quesType.getValue();
            var tag = { type: type };
            props.put_Tag(JSON.stringify(tag));

            var c = this.getColorByType(type);
            var color = Common.Utils.ThemeColor.getRgbColor(c);
            props.put_Color(color.get_r(), color.get_g(), color.get_b());

            return props;
        },

        onDlgBtnClick: function(event) {
            var state = (typeof(event) == 'object') ? event.currentTarget.attributes['result'].value : event;
            if (state == 'ok') {
                this.handler && this.handler.call(this, state, this.getSettings());
                if (this.api) this.api.sync_OnDocBiyueContentControlUpdate();
            }
            this.close();
        },

        updateMetricUnit: function() {
        },

        

        textTitle:          'Biyue内容控制块设置',
        textQuesType:       '类型',
        textQuesSettings:   '题目设置',
        strGeneral:         '一般'
    }, DE.Views.BiyueControlSettingsDialog || {}))
});