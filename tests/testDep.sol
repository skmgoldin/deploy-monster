pragma solidity ^0.4.7;

contract Dep {

    address public owner;
    uint public number;

    function Dep(uint _number) {
        owner = msg.sender;
        number = _number;
    }
}

contract TestDep {
    
    address public sender;
    address public addr;
    uint public number;
    bool public boolean;

    address public dep;


    function TestDep(address _addr, uint _number, bool _boolean) {
        sender = msg.sender;
        addr = _addr;
        number = _number;
        boolean = _boolean;

        dep = new Dep(number);        
    }

}
