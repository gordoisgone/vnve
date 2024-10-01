import React, { useMemo } from "react";

import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from "@udecode/plate-basic-marks/react";
import { useEditorReadOnly } from "@udecode/plate-common/react";

import { Icons } from "@/components/icons";

import { InsertDropdownMenu } from "./insert-dropdown-menu";
import { MarkToolbarButton } from "./mark-toolbar-button";
import { ModeDropdownMenu } from "./mode-dropdown-menu";
import { ToolbarGroup } from "./toolbar";
import { TurnIntoDropdownMenu } from "./turn-into-dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditorStore } from "@/store";
import { Sprite } from "@vnve/next-core";
import { DBAssetType } from "@/db";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function FixedToolbarButtons({ speaker, onChangeSpeaker }) {
  const activeScene = useEditorStore((state) => state.activeScene);
  const characters = useMemo(() => {
    if (!activeScene) {
      return [];
    }

    return activeScene.children.filter(
      (child: Sprite) => child.assetType === DBAssetType.Character,
    );
  }, [activeScene]);

  const handleSelectCharacter = (name: string) => {
    onChangeSpeaker(characters.find((character) => character.name === name));
  };

  return (
    <div className="w-full overflow-hidden">
      <div
        className="flex flex-wrap"
        style={{
          transform: "translateX(calc(-1px))",
        }}
      >
        {
          <>
            <ToolbarGroup noSeparator>
              <Select
                value={speaker.name}
                onValueChange={handleSelectCharacter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="请选择角色" />
                </SelectTrigger>
                <SelectContent>
                  {characters.map((character) => (
                    <SelectItem key={character.name} value={character.name}>
                      {character.label}
                    </SelectItem>
                  ))}
                  {characters.length === 0 && (
                    <div className="select-none py-1.5 pl-2 pr-8 text-sm opacity-50">
                      请先在画布中添加角色
                    </div>
                  )}
                </SelectContent>
              </Select>
            </ToolbarGroup>

            <ToolbarGroup noSeparator>
              <Popover>
                <PopoverTrigger>配置</PopoverTrigger>
                <PopoverContent>
                  语速 停顿 效果 自动显示发言 自动隐藏 Place content for the
                  popover here.
                </PopoverContent>
              </Popover>
            </ToolbarGroup>

            <ToolbarGroup noSeparator>
              <InsertDropdownMenu />
            </ToolbarGroup>

            {/* <ToolbarGroup>
              <MarkToolbarButton nodeType={BoldPlugin.key} tooltip="Bold (⌘+B)">
                <Icons.bold />
              </MarkToolbarButton>
              <MarkToolbarButton
                nodeType={ItalicPlugin.key}
                tooltip="Italic (⌘+I)"
              >
                <Icons.italic />
              </MarkToolbarButton>
              <MarkToolbarButton
                nodeType={UnderlinePlugin.key}
                tooltip="Underline (⌘+U)"
              >
                <Icons.underline />
              </MarkToolbarButton>

              <MarkToolbarButton
                nodeType={StrikethroughPlugin.key}
                tooltip="Strikethrough (⌘+⇧+M)"
              >
                <Icons.strikethrough />
              </MarkToolbarButton>
              <MarkToolbarButton nodeType={CodePlugin.key} tooltip="Code (⌘+E)">
                <Icons.code />
              </MarkToolbarButton>
            </ToolbarGroup> */}
          </>
        }

        {/* <div className="grow" />

        <ToolbarGroup noSeparator>
          <ModeDropdownMenu />
        </ToolbarGroup> */}
      </div>
    </div>
  );
}
