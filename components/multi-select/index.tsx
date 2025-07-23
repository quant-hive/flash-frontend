"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Controller } from "react-hook-form"
import { Badge } from "@/components/ui/badge"

interface MultiSelectProps {
  name: string
  control: any
  options: { value: string; label: string }[]
  placeholder?: string
}

export function MultiSelect({ name, control, options, placeholder = "Search..." }: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Handle click outside to close dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Filter options based on search input
  const getFilteredOptions = (query: string, selectedItems: string[]) => {
    return options.filter(
      (option) => 
        option.label.toLowerCase().includes(query.toLowerCase()) || 
        option.value.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const selectedItems = field.value || []
        const filteredOptions = getFilteredOptions(searchValue, selectedItems)

        const handleSelect = (value: string) => {
          if (selectedItems.includes(value)) {
            field.onChange(selectedItems.filter((item: string) => item !== value))
          } else {
            field.onChange([...selectedItems, value])
          }
          setSearchValue("")
        }

        const handleRemove = (value: string) => {
          field.onChange(selectedItems.filter((item: string) => item !== value))
        }

        return (
          <div className="relative w-full" ref={containerRef}>
            {/* Input field and selected items */}
            <div 
              className="flex flex-wrap gap-2 p-2 border rounded-md bg-background cursor-text min-h-[42px]"
              onClick={() => setIsOpen(true)}
            >
              {selectedItems.map((value: string) => {
                const option = options.find((o) => o.value === value)
                return (
                  <Badge key={value} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                    {option?.label || value}
                    <X
                      className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(value)
                      }}
                    />
                  </Badge>
                )
              })}
              <input
                className="bg-transparent flex-1 outline-none text-sm min-w-[80px]"
                placeholder={selectedItems.length === 0 ? placeholder : ""}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setIsOpen(true)}
              />
            </div>

            {/* Dropdown with options */}
            {isOpen && (
              <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md overflow-auto max-h-[200px]">
                {filteredOptions.length === 0 ? (
                  <div className="p-2 text-sm text-center text-muted-foreground">No results found</div>
                ) : (
                  filteredOptions.map((option) => {
                    const isSelected = selectedItems.includes(option.value)
                    return (
                      <div
                        key={option.value}
                        className={`
                          p-2 text-sm cursor-pointer hover:bg-accent
                          ${isSelected ? 'bg-accent/50' : ''}
                        `}
                        onClick={() => handleSelect(option.value)}
                      >
                        {option.label}
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        )
      }}
    />
  )
}
