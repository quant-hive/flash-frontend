import React, { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { usePathname } from "next/navigation";

const Breadcrumbs = () => {
  const pathname = usePathname();
  const breadcrumbs = pathname
    .split("/")
    .slice(1)
    .map((segment, index) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: `/${segment}`,
    }));

  return (
    <Breadcrumb>
      <BreadcrumbList className="gap-1 sm:gap-1 font-light text-muted-text">
        {/* <BreadcrumbItem>
          <BreadcrumbLink href={"https://www.quanthive.in/"}>
            QuantHive
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>{"/"}</BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Flash</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>{"/"}</BreadcrumbSeparator> */}
        {breadcrumbs.map((breadcrumb, index) => (
          <Fragment key={index}>
            <BreadcrumbItem>
              <BreadcrumbLink
                href={breadcrumb.href}
                className={`${
                  index === breadcrumbs.length - 1 && "text-foreground"
                }`}
              >
                {breadcrumb.label}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && (
              <BreadcrumbSeparator>{"/"}</BreadcrumbSeparator>
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
