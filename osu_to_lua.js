var parser = module.require("osuparser")
var format = module.require('format');

module.export("osu_to_lua", function(osu_contents) {
    var fileContents = ""

    function append(str, newline) {
        if (newline == undefined || newline == true) {
            fileContents += (str + "\n")
        } else {
            fileContents += str
        }
    }

    var beatmap = parser.parseContent(osu_contents)
    if (beatmap.general.mode != 3) {
        append("ERROR: only supported mode: 3 (or osu!mania) only")
        return fileContents
    }

    if (beatmap.hitObjects.length == 0) {
        append("ERROR: empty hit objects")
        return fileContents
    }
    
    append("local Song = {")
    append("")
    append(" -- General")
    append(format(" AudioFileName = %s,", beatmap.general.audioFilename))
    append(format(" AudioAssetId = %s,", "rbxassetid://[INSERT AUDIO HERE]"))
    append(format(" AudioBackgroundId = %s,", "rbxassetid://[INSERT BACKGROUND HERE]"))
    append(format(" AudioPreviewTime = %d,", beatmap.general.previewTime))
    append("")
    append(" -- Metadata")
    append(format(" Title = %s,", beatmap.metadata.titleUnicode != "" ? beatmap.metadata.titleUnicode : beatmap.metadata.title))
    append(format(" Artist = %s,", beatmap.metadata.artistUnicode != "" ? beatmap.metadata.artistUnicode : beatmap.metadata.artist))
    append(format(" Creator = %s,", beatmap.metadata.creator))
    append(format(" Version = %s,", beatmap.metadata.version))
    append(format(" KeyCount = %s,", beatmap.difficulty.circleSize))
    append("")
    append(" Timings = {}, -- Unused")
    append(" HitObjects = {}")
    append("}")
    append("")

    var timings = beatmap.timingPoints.join("|")
    append(format("Song.TIMING = \"%s\"", timings))

    var objects = beatmap.hitObjects.join("|")
    append(format("Song.DATA = \"%s\"", objects))

    append("")
    append("return Song")

    return fileContents
})
