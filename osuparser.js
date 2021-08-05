/**
 * osu-parser re-write
 * simplified version for rosu!mania in-game server parser
 * hitobjects and timingpoints are exported raw and not parsed
 */

"use-strict";

var slider_calc = module.require('slider-calc');

function parseBeatmap() {
    var beatmap = {
        version: "",

        general: {
            audioFilename: "",
            audioLeadIn: 0,
            previewTime: 0,
            countdown: 0,
            sampleSet: "",
            stackLeniency: 0,
            mode: 0,
            letterboxInBreaks: 0
        },

        metadata: {
            title: "",
            titleUnicode: "",
            artist: "",
            artistUnicode: "",
            creator: "",
            version: "",
            source: "",
            tags: []
        },

        difficulty: {
            HPDrainRate: 0,
            circleSize: 0,
            overallDifficulty: 0,
            approachRate: 0,
            sliderMultiplier: 0,
            sliderTickRate: 0
        },

        timingPoints: [],
        hitObjects: []
    }

    var fileSection = ""
    var generalLines = []
    var metadataLines = []
    var difficultyLines = []
    var timingLines = []
    var objectLines = []

    var sectionRegex = /^\[([a-zA-Z0-9]+)\]$/
    var keyValRegex = /^([a-zA-Z0-9]+)[ ]*:[ ]*(.+)$/
    var curveTypes = {
        C: "catmull",
        B: "bezier",
        L: "linear",
        P: "pass-through"
    }

    function parseLine(line) {
        line = line.toString().trim()
        if (!line) return

        if (line.startsWith("//")) return

        var match = sectionRegex.exec(line)
        if (match) {
            fileSection = match[1].toLowerCase()
            return
        }

        switch (fileSection) {
            case "general": {
                generalLines.push(line)
                break;
            }

            case "metadata": {
                metadataLines.push(line)
                break;
            }

            case "difficulty": {
                difficultyLines.push(line)
                break;
            }

            case "hitobjects": {
                objectLines.push(line)
                break;
            }

            case "timingpoints": {
                timingLines.push(line)
                break;
            }

            default: {
                if (!fileSection) {
                    match = /^osu file format (v[0-9]+)$/.exec(line)
                    if (match) {
                        beatmap.version = match[1]
                        return
                    }
                }
            }
        }
    }

    function build() {
        for (var i = 0; i < generalLines; i++) {
            var itr = generalLines[i]

            var parsed = itr.split(":")
            if (parsed.length == 1) continue;

            var arg = parsed[1].trim()

            switch (parsed[0].toLowerCase().trim()) {
                case "audiofilename": {
                    beatmap.general.audioFilename = arg
                    break;
                }

                case "audioleadin": {
                    beatmap.general.audioLeadIn = parseInt(arg)
                    break;
                }

                case "previewtime": {
                    beatmap.general.previewTime = parseInt(arg)
                    break;
                }

                case "countdown": {
                    beatmap.general.countdown = parseInt(arg)
                    break;
                }

                case "sampleset": {
                    beatmap.general.sampleSet = arg
                    break;
                }

                case "stackleniency": {
                    beatmap.general.stackLeniency = parseInt(arg)
                    break;
                }

                // 0: std, 1: taiko, 2: ctb, 3: mania
                case "mode": {
                    beatmap.general.mode = parseInt(arg)
                    break;
                }

                case "letterboxinbreaks": {
                    beatmap.general.letterboxInBreaks = parseInt(arg)
                    break;
                }

                default: { break; }
            }
        }

        for (var i = 0; i < metadataLines; i++) {
            var itr = metadataLines[i]

            var parsed = itr.split(":")
            if (parsed.length == 1) continue;

            var arg = parsed[1].trim()

            switch (parsed[0].toLowerCase().trim()) {
                case "title": {
                    beatmap.metadata.title = arg
                    break;
                }

                case "titleunicode": {
                    beatmap.metadata.titleUnicode = arg
                    break;
                }

                case "artist": {
                    beatmap.metadata.artist = arg
                    break;
                }

                case "artistunicode": {
                    beatmap.metadata.artistUnicode = arg
                    break;
                }

                case "creator": {
                    beatmap.metadata.creator = arg
                    break;
                }

                case "version": {
                    beatmap.metadata.version = arg
                    break;
                }

                case "source": {
                    beatmap.metadata.souce = arg
                    break;
                }

                case "tags": {
                    var tags = arg.split(" ").filter(x => x != "")
                    beatmap.metadata.tags = tags
                    break;
                }
            }
        }

        for (var i = 0; i < metadataLines; i++) {
            var itr = metadataLines[i]

            var parsed = itr.split(":")
            if (parsed.length == 1) continue;

            var arg = parsed[1].trim()

            switch (parsed[0].toLowerCase().trim()) {
                case "hpdrainrate": {
                    beatmap.difficulty.HPDrainRate = parseInt(arg)
                    break;
                }

                case "circlesize": {
                    beatmap.difficulty.circleSize = parseInt(arg)
                    break;
                }

                case "overalldifficulty": {
                    beatmap.difficulty.overallDifficulty = parseInt(arg)
                    break;
                }

                case "approachrate": {
                    beatmap.difficulty.approachRate = parseInt(arg)
                    break;
                }

                case "slidermultiplier": {
                    beatmap.difficulty.sliderMultiplier = parseInt(arg)
                    break;
                }

                case "slidertickrate": {
                    beatmap.difficulty.sliderTickRate = parseInt(arg)
                    break;
                }
            }
        }

        beatmap.timingPoints = timingLines
        beatmap.hitObjects = objectLines
    }

    return {
        parse: parseLine,
        beatmap: beatmap,
        build: build
    }
}

module.export("osuparser", {
    parseContent = function(contents) {
        var result = parseBeatmap();
        contents.toString().split(/[\n\r]+/).forEach(function (line) {
            result.parse(line)
        })

        result.build()
        return result.beatmap;
    }
})
