contract Test {
    
    address public sender;
    address public addr;
    uint public number;
    bool public boolean;

    function Test(address _addr, uint _number, bool _boolean) {
        sender = msg.sender;
        addr = _addr;
        number = _number;
        boolean = _boolean;
    }

}
