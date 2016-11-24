var loadedSelectValues = [];
jQuery.fn.extend({
    loadSelect: function (options) {
        var _this = this;
        if (!_this.length || !_this.is('select')) {
            console.warn("Invalid Selector '" + _this.selector + "'");
            return false;
        }
        if (!(_this.selector in loadedSelectValues)) {
            loadedSelectValues[_this.selector] = {parentValues: [], childernsValues: []};
        }
        _this.xhr = false;
        _this.options = {
            url: '',
            key: 'key',
            value: 'value',
            optionData: [], //{key: '', value: ''}
            selected: false,
            palceHolder: true,
            firstOption: {key: '', value: '--Select--'},
            firstOptionSelectable: false,
            dependingSelector: [],
            notexistIn: [],
            copyTo: [], //{selector: false, key: 'key', value: 'value',autoSelect:true}
            data: {},
            cache: true,
            success: null
        };
        for (var key in _this.options) {
            if (_this.data(key) != undefined && _this.data(key) != '' && _this.data(key) != null) {
                _this.options[key] = _this.data(key);
            }
        }
        $.extend(_this.options, options);
        _this.update = function (options) {
            if (_this.xhr && _this.xhr.readyState != 4) {
                _this.xhr.abort();
            }
            var option = '';
            _this.html('');
            if (_this.options.palceHolder) {
                _this.html($('<option>').val(_this.options.firstOption.key).text(_this.options.firstOption.value).attr('hidden', !_this.options.firstOptionSelectable));
                for (var key in _this.options.copyTo) {
                    $(_this.options.copyTo[key].selector).html($('<option>').val(_this.options.firstOption.key).text(_this.options.firstOption.value).attr('hidden', !_this.options.firstOptionSelectable));
                }
            }
            for (var id in options) {
                if (_this.options.notexistIn.length <= 0 || (_this.options.notexistIn.length && _this.options.notexistIn.indexOf(options[id][_this.options.key]) <= -1)) {
                    option = $('<option>').val(options[id][_this.options.key]).text(options[id][_this.options.value])
                    if (_this.options.selected && ((_this.hasOwnProperty('multiple') && options[id][_this.options.key] in _this.options.selected) || _this.options.selected == options[id][_this.options.key])) {
                        option.attr('selected', 'selected');
                    }
                    if (_this.options.optionData.length) {
                        for (var k in _this.options.optionData) {
                            option.attr('data-' + _this.options.optionData[k].key, options[id][_this.options.optionData[k].value]);
                        }
                    }
                    _this.append(option);
                    if (_this.options.selected && ((_this.hasOwnProperty('multiple') && options[id][_this.options.key] in _this.options.selected) || _this.options.selected == options[id][_this.options.key])) {
                        _this.trigger('change');
                    }
                    if (_this.options.copyTo) {
                        for (var key in _this.options.copyTo) {
                            option = $('<option>').val(options[id][_this.options.copyTo[key].key])
                                    .text(options[id][_this.options.copyTo[key].value])
                                    .attr('class', 'pid_' + options[id][_this.options.key]);
                            $(_this.options.copyTo[key].selector).append(option);
                        }
                    }
                }
            }
            if (_this.options.success != null) {
                _this.options.success();
            }
        }
        _this.load = function () {
            var data = _this.options.data;
            if (_this.options.dependingSelector != []) {
                for (var key in _this.options.dependingSelector) {
                    var val = $(_this.options.dependingSelector[key]).val(),
                            selectorID = _this.dependingSelectorKey(_this.options.dependingSelector[key]);
                    data[selectorID] = val;
                }
            }
            _this.xhr = $.ajax({
                type: "POST",
                url: _this.options.url,
                data: data,
                dataType: 'JSON',
                beforeSend: function () {
                    _this.html('<option value="" hidden="hidden">Loading...</option>');
                },
                success: function (options) {
                    if (_this.options.dependingSelector.length > 0) {
                        for (var key in _this.options.dependingSelector) {
                            var parent_id = $(_this.options.dependingSelector[key]).val(),
                                    selectorID = _this.dependingSelectorKey(_this.options.dependingSelector[key]);
                            if (loadedSelectValues[_this.selector].childernsValues[selectorID] == undefined) {
                                loadedSelectValues[_this.selector].childernsValues[selectorID] = [];
                            }
                            loadedSelectValues[_this.selector].childernsValues[selectorID][parent_id] = options;
                            _this.update(loadedSelectValues[_this.selector].childernsValues[selectorID][parent_id]);
                        }
                    }
                    else {
                        loadedSelectValues[_this.selector].parentValues = options;
                        _this.update(loadedSelectValues[_this.selector].parentValues);
                    }
                }
            });
        };
        _this.dependingSelectorKey = function (id) {
            return id.substr(id.lastIndexOf('#') + 1);
        };
        if (_this.options.dependingSelector.length > 0) {
            if (_this.options.palceHolder) {
                _this.html($('<option>').val(_this.options.firstOption.key).text(_this.options.firstOption.value).attr('hidden', !_this.options.firstOptionSelectable));
                for (var key in _this.options.copyTo) {
                    $(_this.options.copyTo[key].selector).html($('<option>').val(_this.options.firstOption.key).text(_this.options.firstOption.value).attr('hidden', !_this.options.firstOptionSelectable));
                }
            }
            for (var key in _this.options.dependingSelector) {
                $(_this.options.dependingSelector[key]).on('change', function () {
                    var parent_id = $(this).val(), selectorID = $(this).context.id;
                    if (_this.options.cache == false || loadedSelectValues[_this.selector].childernsValues.length == 0 || loadedSelectValues[_this.selector].childernsValues[selectorID] == undefined || loadedSelectValues[_this.selector].childernsValues[selectorID].length == 0 || (loadedSelectValues[_this.selector].childernsValues[selectorID] != undefined && loadedSelectValues[_this.selector].childernsValues[selectorID][parent_id] == undefined)) {
                        _this.load();
                    }
                    else {
                        _this.update(loadedSelectValues[_this.selector].childernsValues[selectorID][parent_id]);
                    }
                });
            }
        }
        else {
            _this.html('<option value="" hidden="hidden">Loading...</option>');
            if (_this.options.palceHolder) {
                for (var key in _this.options.copyTo) {
                    $(_this.options.copyTo[key].selector).html($('<option>').val(_this.options.firstOption.key).text(_this.options.firstOption.value).attr('hidden', !_this.options.firstOptionSelectable));
                }
            }
            if (_this.options.cache == false || loadedSelectValues[_this.selector].parentValues.length == 0) {
                _this.load();
            }
            else {
                _this.update(loadedSelectValues[_this.selector].parentValues);
            }
        }
        if (_this.options.copyTo) {
            _this.on('change', function () {
                for (var key in _this.options.copyTo) {
                    if (_this.options.copyTo[key].autoSelect) {
                        $('option:selected', _this.options.copyTo[key].selector).removeAttr('selected');
                        $('option.pid_' + _this.val(), _this.options.copyTo[key].selector).attr('selected', 'selected');
                    }
                    else {
                        $(_this.options.copyTo[key].selector).val(_this.options.copyTo[key].selected);
                    }
                }
            });
        }
    }
});
