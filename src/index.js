import $ from "jquery"
import WalschaertsValveGear from "./controller.js"
import commands from "./commands.js"

var walschaertsValveGear

$(window).on("load", () => {
        console.log("start")
        walschaertsValveGear = new WalschaertsValveGear('#valvegear')
        $('#toggle-button').bind("click", function() {
            walschaertsValveGear.toggle()
            if (walschaertsValveGear.running()) {
                $(this).removeClass('play').addClass('pause')
            } else {
                $(this).removeClass('pause').addClass('play')
            }
        })

        setExpansion("")
        $('#expansion-control').bind('change', function() {
            setExpansion($(this).val())
        })

        $('#expansion_set_100').bind('click', function() {
            setExpansion('100')
        })
        $('#expansion_set_0').bind('click', function() {
            setExpansion('0')
        })
        $('#expansion_set_minus_100').bind('click', function() {
            setExpansion('-100')
        })
        $('#toggle-points').bind("click", function() {
            walschaertsValveGear.togglePoints()
        })
        $('#toggle-pressure').bind("click", function() {
            walschaertsValveGear.togglePressure()
        })
        $('#execute-special-command').bind("click", function() {
            execute()
        })

        $("#special-command").on('keyup', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            execute()
            e.preventDefault()
            return false
            // Do something
        }
});
})

function setExpansion(value)
{
    if (value === '') {
        value = null
    }
    commands.expansion.call(walschaertsValveGear, value)
}

function parseCommand(command)
{
    command = command.replace(/\s+$/, '').replace(/^\s+/, '')
    if (command == '') {
        return []
    }
    return command.split(/\s+/)
}

function processCommandErrorMessage(message)
{
    alert(message)
}

function execute()
{
    const command = $('#special-command').val().replace(/\s+$/, '').replace(/^\s+/, '')
    $('#special-command').val("")
    executeCommand(command, walschaertsValveGear)
}

function executeCommand(command, walschaertsValveGear)
{

    command = parseCommand(command)
    if (command.length > 0) {
        const cmd = command.shift()
        const msg = doExecuteCommand(cmd, command, walschaertsValveGear)
        if (msg !== null) {
            processCommandErrorMessage(msg)
        }
    }
}

function doExecuteCommand(command, args, walschaertsValveGear)
{
    if (!(command in commands)) {
        return `invalid command: ${command}`
    }
    command = commands[command]
    if (command.length > args.length) {
        return `too few arguments, ${command.length} arguments expected`
    }
    try {
        command.apply(walschaertsValveGear, args)
    } catch(e) {
        return e
    }
    return null
}

