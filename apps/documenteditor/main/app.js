/*
 * (c) Copyright Ascensio System SIA 2010-2024
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
 *  app.js
 *
 *  Created by Alexander Yuzhin on 12/27/13
 *  Copyright (c) 2013 Ascensio System SIA. All rights reserved.
 *
 */

'use strict';
var reqerr;
require.config({
    // The shim config allows us to configure dependencies for
    // scripts that do not call define() to register a module
    baseUrl: '../../',
    paths: {
        jquery          : '../vendor/jquery/jquery',
        underscore      : '../vendor/underscore/underscore',
        backbone        : '../vendor/backbone/backbone',
        text            : '../vendor/requirejs-text/text',
        perfectscrollbar: 'common/main/lib/mods/perfect-scrollbar',
        jmousewheel     : '../vendor/perfect-scrollbar/src/jquery.mousewheel',
        xregexp         : '../vendor/xregexp/xregexp-all-min',
        socketio        : '../vendor/socketio/socket.io.min',
        allfonts        : '../../sdkjs/common/AllFonts',
        sdk             : '../../sdkjs/word/sdk-all-min',
        api             : 'api/documents/api',
        core            : 'common/main/lib/core/application',
        notification    : 'common/main/lib/core/NotificationCenter',
        keymaster       : 'common/main/lib/core/keymaster',
        tip             : 'common/main/lib/util/Tip',
        localstorage    : 'common/main/lib/util/LocalStorage',
        analytics       : 'common/Analytics',
        gateway         : 'common/Gateway',
        locale          : 'common/locale',
        irregularstack  : 'common/IrregularStack'
    },

    shim: {
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        perfectscrollbar: {
            deps: [
                'jmousewheel'
            ]
        },
        notification: {
            deps: [
                'backbone'
            ]
        },
        core: {
            deps: [
                'backbone',
                'notification',
                'irregularstack'
            ]
        },
        sdk: {
            deps: [
                'jquery',
                'allfonts',
                'xregexp',
                'socketio'
            ]
        },
        gateway: {
            deps: [
                'jquery'
            ]
        },
        analytics: {
            deps: [
                'jquery'
            ]
        }
    }
});

require([
    'sdk',
    'backbone',
    'underscore',
    'core',
    'analytics',
    'gateway',
    'locale'
], function (Sdk, Backbone, _, Core) {
    if (Backbone.History && Backbone.History.started)
        return;
    Backbone.history.start();
    window._ = _;

    /**
     * Application instance with DE namespace defined
     */
    var app = new Backbone.Application({
        nameSpace: 'DE',
        autoCreate: false,
        controllers : [
            'Viewport',
            'DocumentHolder',
            'Toolbar',
            'Statusbar',
            'Links',
            'FormsTab',
            'Navigation',
            'PageThumbnails',
            'RightMenu',
            'LeftMenu',
            'Main',
            'ViewTab',
            'Search',
            'DocProtection',
            'Print',
            'Common.Controllers.Fonts',
            'Common.Controllers.History'
            /** coauthoring begin **/
            ,'Common.Controllers.Chat'
            ,'Common.Controllers.Comments'
            ,'Common.Controllers.Draw'
            /** coauthoring end **/
            ,'Common.Controllers.Plugins'
            ,'Common.Controllers.ExternalDiagramEditor'
            ,'Common.Controllers.ExternalMergeEditor'
            ,'Common.Controllers.ExternalOleEditor'
            ,'Common.Controllers.ReviewChanges'
            ,'Common.Controllers.Protection'
        ]
    });

    Common.Locale.apply(
        function() {
            require([
                'common/main/lib/mods/dropdown',
                'common/main/lib/mods/tooltip',
                'common/main/lib/util/LocalStorage',
                'common/main/lib/controller/Scaling',
                'common/main/lib/controller/Themes',
                'common/main/lib/controller/Desktop',
                'documenteditor/main/app/controller/Viewport',
                'documenteditor/main/app/controller/DocumentHolder',
                'documenteditor/main/app/controller/Toolbar',
                'documenteditor/main/app/controller/Statusbar',
                'documenteditor/main/app/controller/FormsTab',
                'documenteditor/main/app/controller/Links',
                'documenteditor/main/app/controller/Navigation',
                'documenteditor/main/app/controller/PageThumbnails',
                'documenteditor/main/app/controller/RightMenu',
                'documenteditor/main/app/controller/LeftMenu',
                'documenteditor/main/app/controller/Main',
                'documenteditor/main/app/controller/ViewTab',
                'documenteditor/main/app/controller/Search',
                'documenteditor/main/app/controller/DocProtection',
                'documenteditor/main/app/controller/Print',
                'documenteditor/main/app/view/FileMenuPanels',
                'common/main/lib/util/utils',
                'common/main/lib/controller/Fonts',
                'common/main/lib/controller/History'
                /** coauthoring begin **/
                ,'common/main/lib/controller/Comments'
                ,'common/main/lib/controller/Chat'
                /** coauthoring end **/
                ,'common/main/lib/controller/Plugins'
                ,'common/main/lib/controller/ExternalDiagramEditor'
                ,'common/main/lib/controller/ExternalMergeEditor'
                ,'common/main/lib/controller/ExternalOleEditor'
                ,'common/main/lib/controller/ReviewChanges'
                ,'common/main/lib/controller/Protection'
                ,'common/main/lib/controller/Draw'
            ], function() {
                app.postLaunchScripts = [
                    'documenteditor/main/code',
                ];
                app.start();
            });
        }
    );
}, function(err) {
    if (err.requireType == 'timeout' && !reqerr && window.requireTimeourError) {
        reqerr = window.requireTimeourError();
        window.alert(reqerr);
        window.location.reload();
    }
});
