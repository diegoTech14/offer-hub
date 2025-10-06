"use client";

import {
  TooltipWrapper,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  TooltipCompound,
  TooltipHeader,
  TooltipBody,
  TooltipFooter,
} from "@/components/ui/tooltip-compound";
import InfoTooltip from "@/components/common/info-tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FieldHelp from "@/components/forms/field-help";

export default function TestTooltipsPage() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold">Tooltip Testing</h1>

          {/* Basic Tooltips */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Basic Tooltips</h2>
            <div className="flex gap-4 flex-wrap">
              <TooltipWrapper content="This is an info tooltip" variant="info">
                <Button>Info</Button>
              </TooltipWrapper>

              <TooltipWrapper
                content="This is a warning tooltip"
                variant="warning"
              >
                <Button>Warning</Button>
              </TooltipWrapper>

              <TooltipWrapper
                content="This is a success tooltip"
                variant="success"
              >
                <Button>Success</Button>
              </TooltipWrapper>

              <TooltipWrapper
                content="This is an error tooltip"
                variant="error"
              >
                <Button>Error</Button>
              </TooltipWrapper>

              <TooltipWrapper content="This is a help tooltip" variant="help">
                <Button>Help</Button>
              </TooltipWrapper>
            </div>
          </section>

          {/* Positions */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Different Positions</h2>
            <div className="flex gap-4 flex-wrap">
              <TooltipWrapper content="Top tooltip" variant="info" side="top">
                <Button>Top</Button>
              </TooltipWrapper>

              <TooltipWrapper
                content="Right tooltip"
                variant="info"
                side="right"
              >
                <Button>Right</Button>
              </TooltipWrapper>

              <TooltipWrapper
                content="Bottom tooltip"
                variant="info"
                side="bottom"
              >
                <Button>Bottom</Button>
              </TooltipWrapper>

              <TooltipWrapper content="Left tooltip" variant="info" side="left">
                <Button>Left</Button>
              </TooltipWrapper>
            </div>
          </section>

          {/* Compound Components */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Compound Components</h2>
            <div className="flex gap-4">
              <TooltipCompound
                content={
                  <div>
                    <TooltipHeader>User Profile</TooltipHeader>
                    <TooltipBody>
                      Click to view your profile settings and preferences
                    </TooltipBody>
                    <TooltipFooter>
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                    </TooltipFooter>
                  </div>
                }
                variant="info"
              >
                <Button>Profile</Button>
              </TooltipCompound>
            </div>
          </section>

          {/* Info Tooltips */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Info Tooltips</h2>
            <div className="flex gap-4 flex-wrap">
              <InfoTooltip
                title="User Settings"
                description="Manage your account preferences and privacy settings"
                variant="info"
              >
                <Button>Settings</Button>
              </InfoTooltip>

              <InfoTooltip
                title="Delete Account"
                description="This action cannot be undone. All your data will be permanently deleted."
                variant="warning"
              >
                <Button variant="destructive">Delete</Button>
              </InfoTooltip>
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Form Integration</h2>
            <div className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <FieldHelp message="This is an error tooltip" variant="error">
                  <Input placeholder="Hover over me" />
                </FieldHelp>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Optional Field
                </label>
                <FieldHelp message="This field is optional" variant="help">
                  <Input placeholder="Optional field" />
                </FieldHelp>
              </div>
            </div>
          </section>
        </div>
      </div>
    </TooltipProvider>
  );
}
