import React, { Fragment, useState } from "react";
import {
  Menu,
  Transition,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import Image from "next/image";
import { IoMdArrowDropup } from "react-icons/io";
import { BiSolidUpArrow, BiSolidDownArrow } from "react-icons/bi";

interface FilterOption {
  id: string;
  name: string;
  icon?: string;
}

interface FilterDropdownProps {
  options: FilterOption[];
  onSelect: (option: FilterOption, isDescending: boolean) => void;
  selectedOption?: FilterOption;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  options,
  onSelect,
  selectedOption,
}) => {
  const [isDescending, setIsDescending] = useState(true);

  const handleOptionSelect = (option: FilterOption) => {
    onSelect(option, isDescending);
    setIsDescending(!isDescending);
  };

  return (
    <Menu as="div" className="relative inline-block text-left w-fit">
      <div>
        <MenuButton className="flex items-center justify-center p-2">
          <Image src="/common/Filter.png" alt="Filter" width={18} height={18} />
        </MenuButton>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute -right-2 mt-2 w-60 origin-top-right z-20 rounded-md border-2 border-primary-100 backdrop-blur-sm bg-black/30 drop-shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <IoMdArrowDropup className="absolute right-[4px] top-[-24px] text-primary-100 size-10" />
          <div className="py-1">
            <div className="flex items-center justify-center px-4 py-2 text-white text-lg font-bold">
              Sort by
            </div>
            {options.map((option) => (
              <MenuItem key={option.id}>
                <button
                  onClick={() => handleOptionSelect(option)}
                  className={`flex w-full items-center px-6 py-3 text-sm font-semibold text-white border-t border-primary-100 hover:bg-primary-100/10 ${
                    selectedOption?.id === option.id ? "bg-primary-100/20" : ""
                  }`}
                >
                  <div className="flex flex-col items-start justify-center flex-grow">
                    <p className="text-white text-sm">{option.name}</p>
                  </div>

                  <div className="flex flex-col ml-2">
                    <button className="size-3">
                      <BiSolidUpArrow
                        className={`w-full h-full ${
                          selectedOption?.id === option.id
                            ? isDescending
                              ? "text-gray-500"
                              : "text-white"
                            : "text-gray-500"
                        }`}
                      />
                    </button>
                    <button className="size-3">
                      <BiSolidDownArrow
                        className={`w-full h-full ${
                          selectedOption?.id === option.id
                            ? isDescending
                              ? "text-white"
                              : "text-gray-500"
                            : "text-gray-500"
                        }`}
                      />
                    </button>
                  </div>
                </button>
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
};

export default FilterDropdown;
